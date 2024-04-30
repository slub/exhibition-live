import { PrismaClient } from "@prisma/client";
import { jsonSchema2PrismaSelect } from "@slub/json-schema-prisma-utils";
import { JSONSchema7 } from "json-schema";
import { toJSONLD } from "./toJSONLD";
import { AbstractDatastore } from "@slub/edb-global-types";
import { PrimaryFieldDeclaration } from "./primaryFields";
import { importAllDocuments, importSingleDocument } from "./import";
import { typeIRItoTypeName, typeNameToTypeIRI } from "./dataStore";

export const prismaStore: (
  prisma: PrismaClient,
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
  };

  return dataStore;
};
