import fs from "fs";
import { jsonSchema2Prisma } from "@slub/json-schema-prisma-utils";

const schemaPath = process.argv[2];

if (!schemaPath) {
  console.error("Usage: jsonSchema2Prisma-cli.js <schemaPath>");
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

export const makeSchema = () => jsonSchema2Prisma(schema, new WeakSet<any>());

const preamble = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
`;

console.log(`${preamble}${makeSchema()}`);
