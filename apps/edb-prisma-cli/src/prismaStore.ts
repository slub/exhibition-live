import {
  jsonSchema2PrismaFlatSelect,
  jsonSchema2PrismaSelect,
} from "@slub/json-schema-prisma-utils";
import { JSONSchema7 } from "json-schema";
import { toJSONLD } from "./toJSONLD";
import { AbstractDatastore } from "@slub/edb-global-types";
import { importAllDocuments, importSingleDocument } from "./import";
import { dataStore } from "./dataStore";
import { PrimaryFieldDeclaration } from "@slub/edb-core-types";
import { defs } from "@slub/json-schema-utils";

const { typeNameToTypeIRI, typeIRItoTypeName } = dataStore;

export const prismaStore: (
  prisma: any,
  rootSchema: JSONSchema7,
  primaryFields: Partial<PrimaryFieldDeclaration>,
) => AbstractDatastore = (prisma, rootSchema, primaryFields) => {
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
    const entries = await prisma.exhibition.findMany({
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
    getClasses: async (entityIRI) => {
      //we will use a rather primitive way to get the classes in future we could create its own IRI<->Class index and use a prisma middleware to keep it up to date
      const definitions = defs(rootSchema);
      const allTypeNames = Object.keys(definitions);
      const classes = [];
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
    upsertDocument: async (typeName: string, document: any) => {},
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
      return await loadManyFlat(typeName, limit, 2);
    },
  };

  return dataStore;
};
