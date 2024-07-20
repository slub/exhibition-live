import fetch from "cross-fetch";
import { exists, findEntityByClass, remove, save } from "@slub/sparql-schema";
import {
  CRUDFunctions,
  SparqlBuildOptions,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import {
  AbstractDatastore,
  CountAndIterable,
  DatastoreBaseConfig,
  InitDatastoreFunction,
} from "@slub/edb-global-types";

export type RestfullDataStoreConfig = {
  apiURL: string;
  defaultPrefix: string;
  jsonldContext: object | string;
  typeNameToTypeIRI: StringToIRIFn;
  queryBuildOptions: SparqlBuildOptions;
  walkerOptions?: Partial<WalkerOptions>;
  sparqlQueryFunctions: CRUDFunctions;
  defaultLimit?: number;
} & DatastoreBaseConfig;

const decodeURIWithHash = (iri: string) => {
  return decodeURIComponent(iri).replace(/#/g, "%23");
};

export const initRestfullStore: InitDatastoreFunction<
  RestfullDataStoreConfig
> = (dataStoreConfig) => {
  const {
    apiURL,
    defaultPrefix,
    jsonldContext,
    typeNameToTypeIRI,
    queryBuildOptions,
    walkerOptions,
    sparqlQueryFunctions: {
      constructFetch,
      selectFetch,
      updateFetch,
      askFetch,
    },
    defaultLimit,
  } = dataStoreConfig;
  const loadDocument = async (typeName: string, entityIRI: string) => {
    console.log("restful loadDocument", typeName, entityIRI);
    return await fetch(
      `${apiURL}/loadDocument/${typeName}?id=${decodeURIWithHash(entityIRI)}`,
    ).then((res) => res.json());
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
  ) => Promise<CountAndIterable<any>> = async (
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
    typeNameToTypeIRI,
    typeIRItoTypeName: (iri: string) => iri.replace(defaultPrefix, ""),
    importDocument: async (typeName, entityIRI, importStore) => {
      throw new Error("Not implemented");
    },
    importDocuments: async (typeName, importStore, limit) => {
      throw new Error("Not implemented");
    },
    loadDocument,
    existsDocument: async (typeName, entityIRI) => {
      return await fetch(
        `${apiURL}/existsDocument/${typeName}?id=${decodeURIWithHash(entityIRI)}`,
      )
        .then((res) => res.text())
        .then((res) => res === "true");
    },
    removeDocument: async (typeName, entityIRI) => {
      return await remove(
        entityIRI,
        typeNameToTypeIRI(typeName),
        dataStoreConfig.schema,
        updateFetch,
        {
          defaultPrefix,
          queryBuildOptions,
        },
      );
    },
    upsertDocument: async (typeName, entityIRI, document) => {
      await fetch(`${apiURL}/upsertDocument/${typeName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(document),
      });
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
