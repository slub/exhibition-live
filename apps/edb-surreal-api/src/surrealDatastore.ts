import { AbstractDatastore } from "@slub/edb-global-types";
import { JSONSchema7 } from "json-schema";
import Surreal from "surrealdb.ts/dist/src";

const uri = "http://127.0.0.1:8000/rpc";

export const database = new Surreal(uri);
await database.use("surrealdb", "test");
export const closeConnection = async () => database.close();
export const surrealDatastore: AbstractDatastore = {
  loadDocument: async (typeName: string, entityIRI: string) => {
    return await database.select([`${typeName}:⟨${entityIRI}⟩`]);
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
