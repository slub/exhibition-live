import { oxigraphCrudOptions } from "@slub/remote-query-implementations";
import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { findEntityByClass, load } from "@slub/sparql-schema";
import { QueryOptions } from "@slub/edb-core-types";
import config from "./config";

const {
  BASE_IRI,
  namespace,
  walkerOptions: defaultWalkerOptions,
  defaultPrefix,
  defaultJsonldContext,
  defaultQueryBuilderOptions,
  sparqlEndpoint,
} = config;

export const typeNameToTypeIRI = (typeName: string) =>
  namespace(typeName).value;

const queryOptions: QueryOptions = {
  defaultPrefix,
  queryBuildOptions: defaultQueryBuilderOptions,
};

const crudOptions = oxigraphCrudOptions(sparqlEndpoint);
const { constructFetch, updateFetch, selectFetch } = crudOptions;

export const loadEntity = async (
  typeName: string,
  typeIRI: string,
  entityIRI: string,
  schema: JSONSchema7,
) => {
  if (!constructFetch) return null;
  const mySchema = bringDefinitionToTop(schema, typeName) as JSONSchema7;
  const res = await load(entityIRI, typeIRI, mySchema, constructFetch, {
    defaultPrefix: BASE_IRI,
    queryBuildOptions: defaultQueryBuilderOptions,
    walkerOptions: defaultWalkerOptions,
  });
  return res.document;
};
export const findEntities = async (
  typeName: string,
  amount: number,
  schema: JSONSchema7,
  search?: string,
) => {
  const typeIRI = typeNameToTypeIRI(typeName);
  const items = await findEntityByClass(
    search || null,
    typeIRI,
    selectFetch,
    { queryBuildOptions: defaultQueryBuilderOptions, defaultPrefix },
    amount,
  );
  return await Promise.all(
    items.map(({ value }: { value: string }) => {
      return loadEntity(typeName, typeIRI, value, schema);
    }),
  );
};
