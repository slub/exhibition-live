import { csvToModel } from "./csvToModel";
import { getDefaultMappingStrategyContext } from "./mappingStrategyContext";
import { dataStore } from "./dataStore";
import { availableFlatMappings } from "@slub/exhibition-schema";
import { FlatImportHandler } from "@slub/edb-cli-creator";

export const flatImportHandler: FlatImportHandler = async ({
  file,
  mimeType,
  mappingDeclaration,
  amount,
  offset,
  dryRun,
  debug,
}) => {
  const { typeName, mapping } = availableFlatMappings[mappingDeclaration];
  let importCounter = 0;
  const mappingStrategyContext = getDefaultMappingStrategyContext(!debug);
  await csvToModel(
    file,
    typeName,
    mapping,
    // @ts-ignore
    mappingStrategyContext,
    async (
      entityIRI: string,
      mappedData: any,
      originalRecord: string[],
      index: number,
    ) => {
      if (dryRun) {
        console.log(
          `Dry run: would import entity ${importCounter + 1} from row ${index}: ${entityIRI}`,
        );
        console.dir(mappedData, { depth: null });
      } else {
        await dataStore.upsertDocument(typeName, entityIRI, mappedData);
        console.log(
          `Imported entity ${importCounter + 1} from row ${index}: ${entityIRI}`,
        );
      }
      importCounter++;
    },
    amount,
    offset,
  );
  process.exit(0);
};
