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
  findEntityByAuthorityIRI,
  findEntityByClass,
  getClasses,
  jsonSchema2Select,
  load,
  remove,
  save,
  searchEntityByLabel,
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
    schema: rootSchema,
  } = dataStoreConfig;

  const typeIRItoTypeName = queryBuildOptions.typeIRItoTypeName;
  const loadDocument = async (typeName: string, entityIRI: string) => {
    const typeIRI = typeNameToTypeIRI(typeName);
    const schema = bringDefinitionToTop(rootSchema, typeName) as JSONSchema7;
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
    const results: any[] = [];
    for (const { value } of items) {
      const doc = await loadDocument(typeName, value);
      if (cb) {
        results.push(await cb(doc));
      } else {
        results.push(doc);
      }
    }
    return results;
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
        rootSchema,
        updateFetch,
        {
          defaultPrefix,
          queryBuildOptions,
        },
      );
    },
    upsertDocument: async (typeName, entityIRI, document) => {
      const schema = bringDefinitionToTop(
        makeStubSchema ? makeStubSchema(rootSchema) : rootSchema,
        typeName,
      );
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
    listDocuments: (typeName, limit, cb) =>
      findDocuments(typeName, limit, null, cb),
    findDocuments: (typeName, query, limit, cb) =>
      findDocuments(typeName, limit, query.search, cb),
    findDocumentsByLabel: async (typeName, label, limit = 10) => {
      const typeIRI = typeNameToTypeIRI(typeName);
      const ids = await searchEntityByLabel(
        label,
        typeIRI,
        selectFetch,
        limit,
        {
          defaultPrefix,
          prefixes: queryBuildOptions.prefixes || {},
          ...queryBuildOptions,
          typeIRItoTypeName,
          primaryFields: queryBuildOptions.primaryFields,
        },
      );
      return ids;
    },
    findDocumentsByAuthorityIRI: async (
      typeName,
      authorityIRI,
      repositoryIRI,
      limit = 10,
    ) => {
      const typeIRI = typeNameToTypeIRI(typeName);
      const ids = await findEntityByAuthorityIRI(
        authorityIRI,
        typeIRI,
        selectFetch,
        limit,
        {
          defaultPrefix,
          prefixes: queryBuildOptions.prefixes || {},
        },
      );
      return ids;
    },
    findDocumentsAsFlatResultSet: async (typeName, query, limit) => {
      const typeIRI = typeNameToTypeIRI(typeName);
      const loadedSchema = bringDefinitionToTop(rootSchema, typeName);
      const { sorting } = query;
      const queryString = withDefaultPrefix(
        defaultPrefix,
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
