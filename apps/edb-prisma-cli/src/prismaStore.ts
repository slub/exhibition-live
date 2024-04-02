import { PrismaClient } from "@prisma/client";
import schema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";
import { jsonSchema2PrismaSelect } from "@slub/json-schema-prisma-utils";
import { JSONSchema7 } from "json-schema";
import { extendSchema } from "./extendSchema";
import { toJSONLD } from "./toJSONLD";
import { AbstractDatastore } from "@slub/edb-global-types";
import { primaryFields } from "./primaryFields";

const prisma = new PrismaClient();

const rootSchema = extendSchema(schema as JSONSchema7);
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
  return entries.map((entry) => toJSONLD(entry));
};

export const prismaStore: AbstractDatastore = {
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
