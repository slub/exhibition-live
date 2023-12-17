import Ajv from "ajv";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isNil from "lodash/isNil";
import set from "lodash/set";
import jsonpath from "jsonpath";

import {
  DeclarativeFlatMappings,
  DeclarativeMappings,
  StrategyContext,
  strategyFunctionMap,
} from "./mappingStrategies";
import { filterUndefOrNull } from "../core";

const getViaSourcePath = (
  sourceData: any,
  sourcePath: string[] | string,
): any => {
  if (Array.isArray(sourcePath)) {
    return get(sourceData, sourcePath);
  }
  if (typeof sourcePath === "string") {
    if (sourcePath.startsWith("$")) {
      return jsonpath.query(sourceData, sourcePath);
    }
    return get(sourceData, sourcePath);
  }
};

const getViaColumnPaths = (
  accessorFn: (col: number | string) => any,
  columnPaths: string[] | number[],
): any => {
  const values = columnPaths.map((path) => accessorFn(path));
  return values;
};

export const mapByConfigFlat = async (
  accessorFn: (col: number | string) => any,
  targetData: any,
  mappingConfig: DeclarativeFlatMappings,
  strategyContext: StrategyContext,
): Promise<any> => {
  const newData = cloneDeep(targetData); //clone targetData to not mutate it accidentally
  const ajv = new Ajv();
  for (const { source, target, mapping } of mappingConfig) {
    const { path: targetPath } = target;
    if (!source?.columns || source.columns.length === 0)
      throw new Error(
        `No source path defined for mapping ${JSON.stringify(mapping)}`,
      );
    const isList = source.columns.length === 1 && source.columns[0];
    if (!mapping?.strategy) {
      //take value as is if no strategy is defined
      const sourceValue = filterUndefOrNull(
        getViaColumnPaths(accessorFn, source.columns),
      );
      if (sourceValue.length === 0) continue;
      if (isList) {
        set(newData, targetPath, sourceValue[0]);
      } else {
        set(newData, targetPath, sourceValue);
      }
    } else {
      const mappingFunction = strategyFunctionMap[mapping.strategy.id];
      if (typeof mappingFunction !== "function") {
        throw new Error(`Strategy ${mapping.strategy.id} is not implemented`);
      }
      const strategyOptions = (mapping.strategy as any).options;
      let value;
      if (isList) {
        value = await mappingFunction(
          getViaColumnPaths(accessorFn, source.columns)[0],
          get(newData, targetPath),
          strategyOptions,
          strategyContext,
        );
      } else {
        value = await mappingFunction(
          getViaColumnPaths(accessorFn, source.columns),
          get(newData, targetPath),
          strategyOptions,
          strategyContext,
        );
        if (Array.isArray(value)) value = filterUndefOrNull(value);
      }
      if (!isNil(value)) set(newData, targetPath, value);
    }
  }
  return newData;
};

export const mapByConfig = async (
  sourceData: Record<string, any>,
  targetData: any,
  mappingConfig: DeclarativeMappings,
  strategyContext: StrategyContext,
): Promise<any> => {
  const newData = cloneDeep(targetData); //clone targetData to not mutate it accidentally
  const ajv = new Ajv();
  for (const { source, target, mapping } of mappingConfig) {
    const { path: sourcePath, expectedSchema } = source;
    const { path: targetPath } = target;
    const hasSourcePath = source?.path && source.path.length > 0;
    const sourceValue = hasSourcePath
      ? getViaSourcePath(sourceData, sourcePath)
      : sourceData;
    if (isNil(sourceValue)) continue;
    if (expectedSchema && !ajv.validate(expectedSchema, sourceValue)) {
      if (strategyContext.options?.strictCheckTargetData)
        throw new Error(
          `Value does not match expected schema ${JSON.stringify(
            expectedSchema,
          )}`,
        );
      console.warn(
        `Value does not match expected schema ${JSON.stringify(
          expectedSchema,
        )}`,
      );
    } else {
      if (!mapping?.strategy) {
        //take value as is if no strategy is defined
        set(newData, targetPath, sourceValue);
      } else {
        const mappingFunction = strategyFunctionMap[mapping.strategy.id];
        if (typeof mappingFunction !== "function") {
          throw new Error(`Strategy ${mapping.strategy.id} is not implemented`);
        }
        const strategyOptions = (mapping.strategy as any).options;
        const value = await mappingFunction(
          sourceValue,
          get(newData, targetPath),
          strategyOptions,
          strategyContext,
        );
        if (!isNil(value)) set(newData, targetPath, value);
      }
    }
  }
  return newData;
};
