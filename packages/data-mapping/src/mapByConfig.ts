import Ajv from "ajv";
import cloneDeep from "lodash-es/cloneDeep";
import get from "lodash-es/get";
import isNil from "lodash-es/isNil";
import set from "lodash-es/set";
import jsonpath from "jsonpath";

import {
  DeclarativeMappings,
  StrategyContext,
  strategyFunctionMap,
} from "./mappingStrategies";

/**
 * Get value from sourceData via a sourcePath which can be either a string or an array of strings
 *  if sourcePath starts with $ it is treated as a jsonpath {@link https://goessner.net/articles/JsonPath/},
 *  that are able to map complex structures just like XPath expressions in XML
 *  {@example $.store.book[*].title will return all titles of books in store}
 *  otherwise it is treated as a lodash path {@link https://lodash.com/docs/4.17.15#get}
 * @param sourceData
 * @param sourcePath
 */
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

/**
 * Map sourceData to targetData by a declarative mappingConfig
 * the initially passed seedData is used as a base for the new data
 * and won't be mutated
 *
 * Look at the docs for more information on certain mapping strategies
 * for the case that no strategy is defined the value will be taken as is
 *
 * @param sourceData
 * @param seedData
 * @param mappingConfig
 * @param strategyContext
 */
export const mapByConfig = async (
  sourceData: Record<string, any>,
  seedData: any,
  mappingConfig: DeclarativeMappings,
  strategyContext: StrategyContext,
): Promise<any> => {
  const newData = cloneDeep(seedData); //clone targetData to not mutate it accidentally
  const ajv = new Ajv();
  for (const { source, target, mapping } of mappingConfig) {
    const { path: sourcePath, expectedSchema } = source;
    const { path: targetPath } = target;
    const { logger } = strategyContext;
    const hasSourcePath = source?.path && source.path.length > 0;
    logger.log(
      `Mapping ${sourcePath} to ${targetPath} using ${mapping?.strategy?.id || "default strategy"}`,
    );
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
      logger.warn(
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
          strategyContext.createDeeperContext(
            strategyContext,
            `${mapping.strategy.id}_${targetPath}`,
            mappingConfig,
          ),
        );
        if (!isNil(value)) {
          set(newData, targetPath, value);
        } else {
          logger.warn(
            `Strategy ${mapping.strategy.id} returned undefined for ${sourceValue}`,
          );
        }
      }
    }
  }
  return newData;
};
