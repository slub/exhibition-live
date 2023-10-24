import Ajv from "ajv";
import cloneDeep from "lodash/cloneDeep";
import get from "lodash/get";
import isNil from "lodash/isNil";
import set from "lodash/set";

import {
  DeclarativeMappings,
  StrategyContext,
  strategyFunctionMap,
} from "./mappingStrategies";

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
    const sourceValue = get(sourceData, sourcePath);
    if (sourceValue) {
      if (expectedSchema && !ajv.validate(expectedSchema, sourceValue)) {
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
            throw new Error(
              `Strategy ${mapping.strategy.id} is not implemented`,
            );
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
  }
  return newData;
};
