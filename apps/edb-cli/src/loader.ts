import config from "./config";
import {oxigraphCrudOptions} from "@slub/remote-query-implementations";
import {bringDefinitionToTop} from "@slub/json-schema-utils";
import {JSONSchema7} from "json-schema";
import {findEntityByClass, load} from "@slub/sparql-schema";
import schema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";

const {
  BASE_IRI,
  namespace,
  walkerOptions: defaultWalkerOptions,
  defaultPrefix,
  defaultQueryBuilderOptions,
  sparqlEndpoint
} = config;
const crudOptions = oxigraphCrudOptions(sparqlEndpoint)
const {constructFetch, selectFetch} = crudOptions;
export const typeNameToTypeIRI =  (typeName: string) => namespace(typeName).value
export const loadEntity = async (typeName: string, entityIRI: string, typeIRI: string) => {
  if (!constructFetch) return null;
  const mySchema = bringDefinitionToTop(schema as JSONSchema7, typeName) as JSONSchema7
  const res = await load(entityIRI, typeIRI, mySchema, constructFetch, {
    defaultPrefix: BASE_IRI,
    queryBuildOptions: defaultQueryBuilderOptions,
    walkerOptions: defaultWalkerOptions,
  });
  return res.document;
}

export const listAll = async (cb: (item: any) => void,  typeName: string, amount: number, search?: string) => {
  const typeIRI = typeNameToTypeIRI(typeName)
  const items = await findEntityByClass(search || null, typeIRI, selectFetch, amount, { queryBuildOptions: defaultQueryBuilderOptions, defaultPrefix })
  await Promise.all(items.map(async ({value}: {value: string}) => {
     const item =  await loadEntity(typeName, value, typeIRI  )
     cb(item)
     return
  }))
}

