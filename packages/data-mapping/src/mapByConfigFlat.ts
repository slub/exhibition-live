import {
  DeclarativeFlatMappings,
  StrategyContext,
  strategyFunctionMap,
} from "./mappingStrategies";
import { MappingOptions } from "./types";
import cloneDeep from "lodash-es/cloneDeep";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import set from "lodash-es/set";
import get from "lodash-es/get";
import isNil from "lodash-es/isNil";

/**
 * Get values from accessorFn via columnPaths,
 * @param accessorFn
 * @param columnPaths
 */
const getViaColumnPaths = (
  accessorFn: (col: number | string) => any,
  columnPaths: (string | number)[],
): any => columnPaths.map((path) => accessorFn(path));
export const mapByConfigFlat = async (
  accessorFn: (col: number | string) => any,
  seedData: any,
  mappingConfig: DeclarativeFlatMappings,
  strategyContext: StrategyContext,
  options: MappingOptions = {},
): Promise<any> => {
  const newData = cloneDeep(seedData); //clone targetData to not mutate it accidentally
  const { logger } = strategyContext;
  for (const { source, target, mapping } of mappingConfig) {
    try {
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
        let value: any;
        if (isList) {
          value = await mappingFunction(
            getViaColumnPaths(accessorFn, source.columns)[0],
            get(newData, targetPath),
            strategyOptions,
            strategyContext.createDeeperContext(
              strategyContext,
              `${mapping.strategy.id}_${targetPath}`,
              mappingConfig,
            ),
          );
        } else {
          value = await mappingFunction(
            getViaColumnPaths(accessorFn, source.columns),
            get(newData, targetPath),
            strategyOptions,
            strategyContext.createDeeperContext(
              strategyContext,
              `${mapping.strategy.id}_${targetPath}`,
              mappingConfig,
            ),
          );
          if (Array.isArray(value)) value = filterUndefOrNull(value);
        }
        if (!isNil(value)) set(newData, targetPath, value);
      }
    } catch (e) {
      if (options.throwOnAttributeError) throw e;
      logger.error(
        `Error while mapping source.columns: ${JSON.stringify(source.columns)} to target.path ${target.path} \n ${e}`,
      );
    }
  }
  return newData;
};
