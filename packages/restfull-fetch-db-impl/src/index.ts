import fetch from "cross-fetch";
import { StringToIRIFn } from "@slub/edb-core-types";
import {
  AbstractDatastore,
  CountAndIterable,
  DatastoreBaseConfig,
  InitDatastoreFunction,
} from "@slub/edb-global-types";
import qs from "qs";

export type RestfullDataStoreConfig = {
  apiURL: string;
  defaultPrefix: string;
  typeNameToTypeIRI: StringToIRIFn;
  defaultLimit?: number;
} & DatastoreBaseConfig;

const decodeURIWithHash = (iri: string) => {
  return decodeURIComponent(iri).replace(/#/g, "%23");
};

export const initRestfullStore: InitDatastoreFunction<
  RestfullDataStoreConfig
> = (dataStoreConfig) => {
  const { apiURL, defaultPrefix, typeNameToTypeIRI, defaultLimit } =
    dataStoreConfig;
  const loadDocument = async (typeName: string, entityIRI: string) => {
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
    const q = {
      search: searchString,
      limit,
    };
    const queryString = qs.stringify(q);
    const items = await fetch(
      `${apiURL}/findDocuments/${typeName}?${queryString}`,
    ).then((res) => res.json());
    if (!items || !Array.isArray(items)) return [];
    return await Promise.all(
      items.map(async (doc) => {
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
    const q = {
      search: searchString,
      limit,
    };
    const queryString = qs.stringify(q);
    const items = await fetch(
      `${apiURL}/findDocuments/${typeName}?${queryString}`,
    ).then((res) => res.json());
    let currentIndex = 0;
    const asyncIterator = {
      next: () => {
        if (currentIndex >= items.length) {
          return Promise.resolve({ done: true, value: null });
        }
        const value = items[currentIndex].value;
        currentIndex++;
        return Promise.resolve({ done: false, value: value });
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
      return await fetch(
        `${apiURL}/removeDocument/${typeName}?id=${decodeURIWithHash(entityIRI)}`,
        {
          method: "DELETE",
        },
      ).then((res) => res.json());
    },
    upsertDocument: async (typeName, entityIRI, document) => {
      return await fetch(`${apiURL}/upsertDocument/${typeName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(document),
      }).then((res) => res.json());
    },
    listDocuments: async (typeName, limit, cb) =>
      findDocuments(typeName, limit, null, cb),
    findDocuments: async (typeName, query, limit, cb) =>
      findDocuments(typeName, limit, query.search, cb),
    findDocumentsByLabel: async (typeName, label, limit) => {
      const queryString = qs.stringify({ label, limit });
      return await fetch(
        `${apiURL}/findDocumentsByLabel/${typeName}?${queryString}`,
      ).then((res) => res.json());
    },
    findDocumentsByAuthorityIRI: async (
      typeName,
      authorityIRI,
      repositoryIRI,
      limit,
    ) => {
      const queryString = qs.stringify({
        authorityIRI: decodeURIWithHash(authorityIRI),
        repositoryIRI: repositoryIRI
          ? decodeURIWithHash(repositoryIRI)
          : undefined,
        limit,
      });
      return await fetch(
        `${apiURL}/findDocumentsByAuthorityIRI/${typeName}?${queryString}`,
      ).then((res) => res.json());
    },
    findDocumentsAsFlatResultSet: async (typeName, query, limit) => {
      const sorting =
        query.sorting?.map(({ id, desc }) => `${id}${desc ? " desc" : ""}`) ||
        [];
      const q = {
        search: query.search,
        sorting,
        limit,
      };
      const queryString = qs.stringify(q);

      return await fetch(
        `${apiURL}/findDocumentsAsFlat/${typeName}?${queryString}`,
      ).then((res) => res.json());
    },
    getClasses: (entityIRI: string) => {
      return fetch(`${apiURL}/classes?id=${decodeURIWithHash(entityIRI)}`).then(
        (res) => res.json(),
      );
    },
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
