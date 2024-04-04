import { AbstractDatastore } from "@slub/edb-global-types";
import { JSONSchema7 } from "json-schema";
import Surreal from "surrealdb.ts/dist/src";

const uri = "http://127.0.0.1:8000/rpc";

export const database = new Surreal(uri);
await database.use("surrealdb", "test");
export const closeConnection = async () => database.close();
export const surrealDatastore: AbstractDatastore = {
  typeNameToTypeIRI: (typeName: string) => typeName,
  typeIRItoTypeName: (typeIRI: string) => typeIRI,
  importDocument: async (
    typeName: string,
    entityIRI: any,
    importStore: AbstractDatastore,
  ) => {
    return await importStore.loadDocument(typeName, entityIRI);
  },
  importDocuments: async (
    typeName: string,
    importStore: AbstractDatastore,
    limit: number,
  ) => {
    return await importStore.listDocuments(typeName, limit);
  },
  loadDocument: async (typeName: string, entityIRI: string) => {
    return await database.select([`${typeName}:⟨${entityIRI}⟩`]);
  },
  removeDocument: async (typeName: string, entityIRI: string) => {
    database.delete([`${typeName}:⟨${entityIRI}⟩`]);
  },
  existsDocument: async (typeName: string, entityIRI: string) => {
    return Boolean(await database.select([`${typeName}:⟨${entityIRI}⟩`]));
  },
  upsertDocument: async (
    typeName: string,
    entityIRI: string,
    document: any,
  ) => {
    return database.create(typeName, {
      ...document,
      id: entityIRI || document["@id"],
    });
  },
  listDocuments: async (typeName: string, limit?: number) => {
    return database.select(typeName);
  },
  findDocuments: async (
    typeName: string,
    query: { search?: string },
    limit?: number,
  ) => {
    return database.select(typeName);
  },
};
