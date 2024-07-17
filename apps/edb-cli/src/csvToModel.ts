import {
  DeclarativeMatchBasedFlatMappings,
  mapFromFlatResource,
  StrategyContext,
} from "@slub/edb-data-mapping";
import { typeNameToTypeIRI } from "./dataStore";
import { v3 as uuidv3 } from "uuid";
import { slent } from "@slub/exhibition-sparql-config";
import { processCSV } from "./mapping";

export const csvToModel = async (
  file: string,
  typeName: string,
  matchBasedFlatMappings: DeclarativeMatchBasedFlatMappings,
  strategyContext: StrategyContext,
  onMappedData: (
    entityIRI: string,
    mappedData: any,
    originalRecord: string[],
    index: number,
  ) => Promise<void>,
  amount?: number,
  offset?: number,
) =>
  await mapFromFlatResource(
    typeNameToTypeIRI(typeName),
    matchBasedFlatMappings,
    strategyContext,
    processCSV(file),
    (record: string[]) => slent(uuidv3(record.join(), uuidv3.URL)).value,
    onMappedData,
    amount,
    offset,
  );
