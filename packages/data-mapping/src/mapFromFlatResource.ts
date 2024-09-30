import { makeColumnDesc } from "@slub/edb-core-utils";
import {
  DeclarativeMatchBasedFlatMappings,
  matchBased2DeclarativeFlatMappings,
} from "./matchBased2DeclarativeFlatMapping";
import { DeclarativeFlatMappings, StrategyContext } from "./mappingStrategies";
import { ProcessFlatResourceFn } from "./types";
import { mapByConfigFlat } from "./mapByConfigFlat";

/**
 * Map data from a flat resource (e.g. CSV) to entities.
 *
 * @param typeIRI the type IRI of the entities each record represents
 * @param matchBasedFlatMappings the flat mapping declarations
 * @param strategyContext
 * @param processFlatResourceFn the function to process the flat resource
 * @param newIRI a function to generate a new IRI for each record, optionally based on the record
 * @param onMappedData a function to handle the mapped data
 * @param amount the amount of records to process from the resource
 * @param offset the offset to start processing from
 */
export const mapFromFlatResource = async (
  typeIRI: string,
  matchBasedFlatMappings: DeclarativeMatchBasedFlatMappings,
  strategyContext: StrategyContext,
  processFlatResourceFn: ProcessFlatResourceFn,
  newIRI: (record: string[]) => string,
  onMappedData: (
    entityIRI: string,
    mappedData: any,
    originalRecord: string[],
    index: number,
  ) => Promise<void>,
  amount?: number,
  offset?: number,
) => {
  let flatMappings: DeclarativeFlatMappings | null = null;
  const { logger } = strategyContext;
  await processFlatResourceFn(
    async (header) => {
      const columnDesc = makeColumnDesc(header);
      flatMappings = matchBased2DeclarativeFlatMappings(
        columnDesc,
        matchBasedFlatMappings,
        { throwOnMappingError: false },
      );
      return;
    },
    async (record, index) => {
      if (!flatMappings) {
        throw new Error("No mapping found");
      }
      try {
        const mappedData = await mapByConfigFlat(
          (colIndex) => record[colIndex],
          {
            "@type": typeIRI,
            "@id": newIRI(record),
          },
          flatMappings,
          strategyContext,
        );
        await onMappedData(mappedData["@id"], mappedData, record, index);
      } catch (e) {
        logger.error(`Error while mapping record ${index} \n ${e}`);
      }
    },
    amount,
    offset,
  );
};
