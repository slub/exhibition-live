import {
  jsonSchema2PrismaFlatSelect,
  jsonSchema2PrismaSelect,
} from "@slub/json-schema-prisma-utils";
import { JSONSchema7 } from "json-schema";
import { toJSONLD } from "./helper";
import { AbstractDatastore } from "@slub/edb-global-types";
import { importAllDocuments, importSingleDocument } from "./import";
import {
  IRIToStringFn,
  PrimaryFieldDeclaration,
  StringToIRIFn,
} from "@slub/edb-core-types";
import {
  bringDefinitionToTop,
  defs,
  prepareStubbedSchema,
} from "@slub/json-schema-utils";
import { cleanJSONLD } from "@slub/sparql-schema";
import { save } from "./save";
import { bindings2RDFResultSet } from "./helper/bindings2RDFResultSet";

export type PrismaStoreOptions = {
  jsonldContext: any;
  defaultPrefix: string;
  typeNameToTypeIRI: StringToIRIFn;
  typeIRItoTypeName: IRIToStringFn;
};

/**
 * Initialize a prisma store with the given prisma client
 *
 * The schema and the prisma client must be compatible otherwise the store will not work as expected
 *
 * The store will use the jsonld context to convert the data to jsonld
 *
 *
 * @param prisma The prisma client to be used
 * @param rootSchema The root schema of the data
 * @param primaryFields The primary fields of the data (labels, descriptions, etc.)
 * @param jsonldContext The jsonld context to be used
 * @param defaultPrefix The default prefix to be used
 * @param typeNameToTypeIRI A function to convert a type name to a type IRI
 * @param typeIRItoTypeName A function to convert a type IRI to a type name
 */
export const initPrismaStore: (
  prisma: any,
  rootSchema: JSONSchema7,
  primaryFields: Partial<PrimaryFieldDeclaration>,
  options: PrismaStoreOptions,
) => AbstractDatastore = (
  prisma,
  rootSchema,
  primaryFields,
  { jsonldContext, defaultPrefix, typeNameToTypeIRI, typeIRItoTypeName },
) => {
  const load = async (typeName: string, entityIRI: string) => {
    const select = jsonSchema2PrismaSelect(typeName, rootSchema, {
      maxRecursion: 4,
    });
    const entry = await prisma[typeName].findUnique({
      where: {
        id: entityIRI,
      },
      select,
    });
    return toJSONLD(entry);
  };

  const loadMany = async (typeName: string, limit?: number) => {
    const select = jsonSchema2PrismaSelect(typeName, rootSchema, {
      maxRecursion: 4,
    });
    const entries = await prisma[typeName].findMany({
      take: limit,
      select,
    });
    return entries.map((entry: any) => toJSONLD(entry));
  };

  const loadManyFlat = async (
    typeName: string,
    limit?: number,
    innerLimit?: number,
  ) => {
    const query = jsonSchema2PrismaFlatSelect(
      typeName,
      rootSchema,
      primaryFields,
      { takeLimit: innerLimit ?? limit ?? 0 },
    );
    const entries = await prisma[typeName].findMany({
      take: limit,
      ...query,
    });
    return entries;
  };

  const searchMany = async (
    typeName: string,
    searchString: string,
    limit?: number,
  ) => {
    const select = jsonSchema2PrismaSelect(typeName, rootSchema, {
      maxRecursion: 4,
    });
    const prim = primaryFields[typeName];
    if (!prim) {
      throw new Error("No primary field found for type " + typeName);
    }
    const entries = await prisma[typeName].findMany({
      where: {
        [prim.label]: {
          contains: searchString,
        },
      },
      take: limit,
      select,
    });
    return entries.map((entry: any) => toJSONLD(entry));
  };
  const dataStore: AbstractDatastore = {
    typeNameToTypeIRI: typeNameToTypeIRI,
    typeIRItoTypeName: typeIRItoTypeName,
    importDocument: (typeName, entityIRI, importStore) =>
      importSingleDocument(typeName, entityIRI, importStore, prisma),
    importDocuments: (typeName, importStore, limit) =>
      importAllDocuments(typeName, importStore, prisma, limit),
    loadDocument: async (typeName: string, entityIRI: string) => {
      return load(typeName, entityIRI);
    },
    findDocuments: async (typeName, query, limit, cb) => {
      const entries =
        query.search && query.search.length > 0
          ? await searchMany(typeName, query.search, limit)
          : await loadMany(typeName, limit);
      if (cb) {
        for (const entry of entries) {
          await cb(entry);
        }
      }
      return entries;
    },
    existsDocument: async (typeName: string, entityIRI: string) => {
      const entry = await prisma[typeName].findUnique({
        where: {
          id: entityIRI,
        },
        select: {
          id: true,
        },
      });
      return Boolean(entry);
    },
    removeDocument: async (typeName: string, entityIRI: string) => {
      return await prisma[typeName].delete({
        where: {
          id: entityIRI,
        },
      });
    },
    upsertDocument: async (typeName: string, entityIRI, document: any) => {
      const schema = bringDefinitionToTop(
        prepareStubbedSchema(rootSchema),
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
        keepContext: false,
      });

      const error = new Set<string>();

      const result = await save(typeName, cleanData, prisma, error);
      if (error.size > 0) {
        throw new Error("Error while saving data");
      }
      return {
        "@context": jsonldContext,
        ...cleanData,
      };
    },
    listDocuments: async (typeName: string, limit: number = 10, cb) => {
      const entries = await loadMany(typeName, limit);
      if (cb) {
        for (const entry of entries) {
          await cb(entry);
        }
      }
      return entries;
    },
    findDocumentsAsFlatResultSet: async (typeName, query, limit) => {
      const bindings = await loadManyFlat(typeName, limit, 2);
      return bindings2RDFResultSet(bindings);
    },
    findDocumentsByAuthorityIRI: async (
      typeName,
      authorityIRI,
      repositoryIRI,
      limit,
    ) => {
      const entries = await prisma[typeName].findMany({
        where: repositoryIRI
          ? {
              idAuthority_id: authorityIRI,
              idAuthority_authority: repositoryIRI,
            }
          : {
              idAuthority_id: authorityIRI,
            },
        select: {
          id: true,
        },
        take: limit,
      });

      return entries.map((e) => e.id);
    },
    findDocumentsByLabel: async (typeName, label, limit) => {
      const primaryFieldDeclaration = primaryFields[typeName];
      if (!primaryFieldDeclaration?.label) {
        throw new Error("No primary field found for type " + typeName);
      }
      const ids = await prisma[typeName].findMany({
        where: {
          [primaryFieldDeclaration.label]: label,
        },
        select: {
          id: true,
        },
        take: limit,
      });
      return ids.map((e) => e.id);
    },
    getClasses: async (entityIRI) => {
      //we will use a rather primitive way to get the classes in future we could create its own IRI<->Class index and use a prisma middleware to keep it up to date
      const definitions = defs(rootSchema);
      const allTypeNames = Object.keys(definitions);
      const classes: string[] = [];
      for (const typeName of allTypeNames) {
        try {
          const entry = await prisma[typeName].findUnique({
            where: {
              id: entityIRI,
            },
            select: {
              id: true,
            },
          });
          if (entry) {
            classes.push(typeNameToTypeIRI(typeName));
          }
        } catch (e) {
          console.error("Error while trying to get class for", e);
        }
      }
      return classes;
    },
  };

  return dataStore;
};
