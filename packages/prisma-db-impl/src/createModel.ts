import { jsonSchema2Prisma } from "@slub/json-schema-prisma-utils";
import schema from "@slub/exhibition-schema/schemas/jsonschema/Exhibition.schema.json";
import { extendSchema } from "./extendSchema";

const extendedSchema = extendSchema(schema);

const preamble = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
`;
export const makeSchema = () =>
  jsonSchema2Prisma(extendedSchema, new WeakSet<any>());

console.log(`${preamble}${makeSchema()}`);
