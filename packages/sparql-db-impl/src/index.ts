import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { findEntityByClass, load } from "@slub/sparql-schema";
import { CRUDFunctions, SparqlBuildOptions } from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import {
  AbstractDatastore,
  DatastoreBaseConfig,
  InitDatastoreFunction,
  QueryType,
} from "@slub/edb-global-types";

type SPARQLDataStoreConfig = {
  defaultPrefix: string;
  typeNameToTypeIRI: (typeName: string) => string;
  queryBuildOptions: SparqlBuildOptions;
  walkerOptions?: Partial<WalkerOptions>;
  sparqlQueryFunctions: CRUDFunctions;
  defaultLimit?: number;
} & DatastoreBaseConfig;

export const initSPARQLStore: InitDatastoreFunction<SPARQLDataStoreConfig> = (
  dataStoreConfig,
) => {
  const {
    defaultPrefix,
    typeNameToTypeIRI,
    queryBuildOptions,
    walkerOptions,
    sparqlQueryFunctions: { constructFetch, selectFetch },
    defaultLimit,
  } = dataStoreConfig;
  const loadDocument = async (typeName: string, entityIRI: string) => {
    const typeIRI = typeNameToTypeIRI(typeName);
    const schema = bringDefinitionToTop(
      dataStoreConfig.schema,
      typeName,
    ) as JSONSchema7;
    const res = await load(entityIRI, typeIRI, schema, constructFetch, {
      defaultPrefix,
      queryBuildOptions,
      walkerOptions,
      maxRecursion: walkerOptions?.maxRecursion,
    });
    return res.document;
  };
  const findDocuments = async (
    typeName: string,
    limit?: number,
    searchString?: string | null,
    cb?: (document: any) => Promise<any>,
  ) => {
    const typeIRI = typeNameToTypeIRI(typeName);
    const items = await findEntityByClass(
      searchString || null,
      typeIRI,
      selectFetch,
      { queryBuildOptions, defaultPrefix },
      limit || defaultLimit,
    );
    return await Promise.all(
      items.map(async ({ value }: { value: string }) => {
        const doc = await loadDocument(typeName, value);
        if (cb) {
          return await cb(doc);
        }
        return doc;
      }),
    );
  };
  return {
    loadDocument,
    upsertDocument: async (typeName, entityIRI, document) => {
      throw new Error("Not implemented");
    },
    listDocuments: async (typeName, limit, cb) =>
      findDocuments(typeName, limit, null, cb),
    findDocuments: async (typeName, query, limit, cb) =>
      findDocuments(typeName, limit, query.search, cb),
  } as AbstractDatastore;
};
