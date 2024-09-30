import { SemanticSeedHandler } from "@slub/edb-cli-creator";
import { processEachDocumentFromFile } from "@slub/edb-file-import";
import config from "@slub/exhibition-sparql-config";
import { typeNameToTypeIRI } from "./dataStore";

export const seedHandler: SemanticSeedHandler = async ({
  file,
  schema,
  onDocument,
}) => {
  return processEachDocumentFromFile(file, schema, onDocument, {
    jsonldContext: config.defaultJsonldContext,
    defaultPrefix: config.defaultPrefix,
    walkerOptions: config.walkerOptions,
    typeNameToTypeIRI: typeNameToTypeIRI,
  });
};
