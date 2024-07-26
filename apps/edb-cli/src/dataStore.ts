import config from "@slub/exhibition-sparql-config";
import {
  getProviderOrDefault,
  getSPARQLFlavour,
} from "@slub/remote-query-implementations";
import { initSPARQLDataStoreFromConfig } from "@slub/sparql-db-impl";
import { extendSchemaShortcut } from "@slub/json-schema-utils";
import { primaryFields, schema } from "@slub/exhibition-schema";
import { JSONSchema7 } from "json-schema";
import { initPrismaStore } from "@slub/prisma-db-impl";
import {
  typeIRItoTypeName,
  typeNameToTypeIRI,
} from "@slub/edb-api/src/dataStore";
import { PrismaClient } from "@prisma/edb-exhibition-client";

const initPrisma = async () => {
  const rootSchema = extendSchemaShortcut(schema as JSONSchema7, "type", "id");
  const prisma = new PrismaClient();
  //bun only runs if we call it here: why??
  //find first object that can be counted:
  for (const key of Object.keys(prisma)) {
    if (prisma[key]?.count) {
      const c = await prisma[key].count();
      console.log(c);
      break;
    }
  }
  return initPrismaStore(prisma, rootSchema, primaryFields, {
    jsonldContext: config.defaultJsonldContext,
    defaultPrefix: config.defaultPrefix,
    typeIRItoTypeName: typeIRItoTypeName,
    typeNameToTypeIRI: typeNameToTypeIRI,
  });
};

export const provider = getProviderOrDefault(config.sparqlEndpoint);
if (!provider) {
  throw new Error("No provider found for the given SPARQL endpoint");
}
export const crudFunctions = provider(config.sparqlEndpoint);

export const dataStore =
  process.env.DATABASE_PROVIDER === "sparql"
    ? initSPARQLDataStoreFromConfig(
        config,
        crudFunctions,
        getSPARQLFlavour(config.sparqlEndpoint),
      )
    : await initPrisma();

export const importStores = {
  oxigraph: initSPARQLDataStoreFromConfig(
    config,
    crudFunctions,
    getSPARQLFlavour(config.sparqlEndpoint),
  ),
};
