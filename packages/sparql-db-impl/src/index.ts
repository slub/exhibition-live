import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { findEntityByClass, load } from "@slub/sparql-schema";
import { CRUDFunctions, SparqlBuildOptions } from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import {
  AbstractDatastore,
  CountAndIterable,
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
  const findDocumentsIterable: (
    typeName: string,
    limit?: number,
    searchString?: string | null,
  ) => Promise<CountAndIterable> = async (
    typeName: string,
    limit?: number,
    searchString?: string | null,
  ) => {
    const typeIRI = typeNameToTypeIRI(typeName);
    const items = await findEntityByClass(
      searchString || null,
      typeIRI,
      selectFetch,
      { queryBuildOptions, defaultPrefix },
      limit || defaultLimit,
    );
    let currentIndex = 0;
    const asyncIterator = {
      next: () => {
        if (currentIndex >= items.length) {
          return Promise.resolve({ done: true, value: null });
        }
        const value = items[currentIndex].value;
        currentIndex++;
        return loadDocument(typeName, value).then((doc) => {
          return { done: false, value: doc };
        });
      },
    };
    return {
      amount: items.length,
      iterable: {
        [Symbol.asyncIterator]: () => asyncIterator,
      },
    };
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
    iterableImplementation: {
      listDocuments: (typeName, limit) => {
        return findDocumentsIterable(typeName, limit, null);
      },
      findDocuments: (typeName, query, limit) => {
        return findDocumentsIterable(typeName, limit, query.search);
      },
    },
  } as AbstractDatastore;
};
