import config from "@slub/exhibition-sparql-config";
import { oxigraphCrudOptions } from "@slub/remote-query-implementations";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import { schema } from "@slub/exhibition-schema";
import { JSONSchema7 } from "json-schema";

const {
  namespace,
  walkerOptions,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sparqlEndpoint,
} = config;
const crudOptions = oxigraphCrudOptions(sparqlEndpoint);
export const typeNameToTypeIRI = (typeName: string) =>
  namespace(typeName).value;

export const dataStore = initSPARQLStore({
  defaultPrefix,
  typeNameToTypeIRI,
  queryBuildOptions: defaultQueryBuilderOptions,
  walkerOptions: {
    maxRecursion: 4,
    maxRecursionEachRef: 2,
    skipAtLevel: 1,
    omitEmptyArrays: true,
    omitEmptyObjects: true,
  },
  sparqlQueryFunctions: crudOptions,
  schema: schema as JSONSchema7,
  defaultLimit: 10,
});
