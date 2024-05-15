import config from "@slub/exhibition-sparql-config";
import { oxigraphCrudOptions } from "@slub/remote-query-implementations";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import schema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";
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
  walkerOptions,
  sparqlQueryFunctions: crudOptions,
  schema: schema as JSONSchema7,
  defaultLimit: 10,
});
