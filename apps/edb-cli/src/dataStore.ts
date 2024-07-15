import config from "@slub/exhibition-sparql-config";
import { oxigraphCrudOptions } from "@slub/remote-query-implementations";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import {
  primaryFieldExtracts,
  primaryFields,
  schema,
} from "@slub/exhibition-schema";
import { JSONSchema7 } from "json-schema";

const {
  namespace,
  walkerOptions,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sparqlEndpoint,
  BASE_IRI,
} = config;
export const crudFns = oxigraphCrudOptions(sparqlEndpoint);
export const typeNameToTypeIRI = (typeName: string) =>
  namespace(typeName).value;
export const typeIRItoTypeName = (iri: string) => {
  return iri?.substring(BASE_IRI.length, iri.length);
};

export const dataStore = initSPARQLStore({
  defaultPrefix,
  typeNameToTypeIRI,
  queryBuildOptions: {
    prefixes: defaultQueryBuilderOptions.prefixes as Record<string, string>,
    propertyToIRI: typeNameToTypeIRI,
    typeIRItoTypeName,
    primaryFields,
    primaryFieldExtracts,
  },
  walkerOptions: {
    maxRecursion: 4,
    maxRecursionEachRef: 2,
    skipAtLevel: 1,
    omitEmptyArrays: true,
    omitEmptyObjects: true,
  },
  sparqlQueryFunctions: crudFns,
  schema: schema as JSONSchema7,
  defaultLimit: 10,
});
