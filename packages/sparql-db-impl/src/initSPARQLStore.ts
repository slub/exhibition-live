import {
  AbstractDatastore,
  CountAndIterable,
  InitDatastoreFunction,
} from "@slub/edb-global-types";
import { SPARQLDataStoreConfig } from "./SPARQLDataStoreConfig";
import { bringDefinitionToTop } from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import {
  cleanJSONLD,
  exists,
  findEntityByClass,
  getClasses,
  jsonSchema2Select,
  load,
  remove,
  save,
  withDefaultPrefix,
} from "@slub/sparql-schema";

export const initSPARQLStore: InitDatastoreFunction<SPARQLDataStoreConfig> = (
  dataStoreConfig,
) => {
  const {
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
    makeStubSchema,
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
      return await exists(entityIRI, typeNameToTypeIRI(typeName), askFetch);
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
      const schema = makeStubSchema
        ? bringDefinitionToTop(makeStubSchema(dataStoreConfig.schema), typeName)
        : dataStoreConfig.schema;
      const doc = {
        ...document,
        "@id": entityIRI,
        "@type": typeNameToTypeIRI(typeName),
      };
      const cleanData = await cleanJSONLD(doc, schema, {
        jsonldContext,
        defaultPrefix,
        keepContext: true,
      });
      await save(cleanData, schema, updateFetch, {
        defaultPrefix,
        queryBuildOptions,
      });
      return doc;
    },
    listDocuments: async (typeName, limit, cb) =>
      findDocuments(typeName, limit, null, cb),
    findDocuments: async (typeName, query, limit, cb) =>
      findDocuments(typeName, limit, query.search, cb),
    findDocumentsAsFlatResultSet: async (typeName, query, limit) => {
      const typeIRI = typeNameToTypeIRI(typeName);
      const loadedSchema = bringDefinitionToTop(
        dataStoreConfig.schema,
        typeName,
      );
      const { sorting } = query;
      const queryString = withDefaultPrefix(
        dataStoreConfig.defaultPrefix,
        jsonSchema2Select(
          loadedSchema,
          typeIRI,
          [],
          {
            primaryFields: queryBuildOptions.primaryFields,
            ...(sorting && sorting.length > 0
              ? {
                  orderBy: sorting.map((s) => ({
                    orderBy: s.id,
                    descending: Boolean(s.desc),
                  })),
                }
              : {}),
            limit: limit || defaultLimit,
          },
          undefined,
          queryBuildOptions.sparqlFlavour,
        ),
      );
      const res = await selectFetch(queryString, {
        withHeaders: true,
      });
      return res;
    },
    getClasses: (entityIRI) => {
      return getClasses(entityIRI, selectFetch, {
        defaultPrefix,
        queryBuildOptions,
      });
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
