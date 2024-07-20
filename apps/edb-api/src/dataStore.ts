import config from "@slub/exhibition-sparql-config";
import { oxigraphCrudOptions } from "@slub/remote-query-implementations";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import { makeStubSchema, schema } from "@slub/exhibition-schema";
import { JSONSchema7 } from "json-schema";
import { primaryFieldExtracts, primaryFields } from "@slub/exhibition-schema";
import { typeIRItoTypeName } from "@slub/edb-cli/src/dataStore";

const {
  namespace,
  walkerOptions,
  defaultPrefix,
  defaultJsonldContext,
  defaultQueryBuilderOptions,
  sparqlEndpoint,
} = config;
const crudOptions = oxigraphCrudOptions(sparqlEndpoint);
export const typeNameToTypeIRI = (typeName: string) =>
  namespace(typeName).value;

export const dataStore = initSPARQLStore({
  defaultPrefix,
  jsonldContext: defaultJsonldContext,
  typeNameToTypeIRI,
  queryBuildOptions: {
    prefixes: defaultQueryBuilderOptions.prefixes as Record<string, string>,
    propertyToIRI: typeNameToTypeIRI,
    typeIRItoTypeName,
    primaryFields,
    primaryFieldExtracts,
  },
  walkerOptions,
  sparqlQueryFunctions: crudOptions,
  schema: schema as JSONSchema7,
  defaultLimit: 10,
  makeStubSchema: makeStubSchema,
});
