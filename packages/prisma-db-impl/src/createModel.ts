import { jsonSchema2Prisma } from "@slub/json-schema-prisma-utils";
import { schema } from "@slub/exhibition-schema";
import { extendSchema } from "./extendSchema";

const extendedSchema = extendSchema(schema);

const preamble = `
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/@prisma/edb-exhibition-client"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
`;
export const makeSchema = () =>
  jsonSchema2Prisma(extendedSchema, new WeakSet<any>());

console.log(`${preamble}${makeSchema()}`);
