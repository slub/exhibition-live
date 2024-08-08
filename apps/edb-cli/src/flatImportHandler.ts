import { csvToModel } from "./csvToModel";
import { mappingStrategyContext } from "./mappingStrategyContext";
import { dataStore } from "./dataStore";
import { availableFlatMappings } from "@slub/exhibition-schema";

export const flatImportHandler = async ({
  file,
  mimeType,
  mappingDeclaration,
  amount,
  offset,
  dryRun,
}: {
  file: string;
  mimeType: string | undefined;
  mappingDeclaration: string;
  amount: number | undefined;
  offset: number | undefined;
  dryRun: boolean;
}) => {
  const { typeName, mapping } = availableFlatMappings[mappingDeclaration];
  let importCounter = 0;
  await csvToModel(
    file,
    typeName,
    mapping,
    mappingStrategyContext,
    async (entityIRI, mappedData, originalRecord, index) => {
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
