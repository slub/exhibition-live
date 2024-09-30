---
to: manifestation/<%= name %>/src/schema.ts
---
import { JSONSchema7 } from "json-schema";
import { extendDefinitionsWithProperties } from "@slub/json-schema-utils";
import { schemaExpander } from "./makeStubSchema";

export const schemaName = "<%= h.changeCase.paramCase(name) %>";

const rawSchema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://schema.adb.arthistoricum.net/<%= h.changeCase.paramCase(name) %>#v1",
  title: "SLUB <%= name %> Datenbank",
  $defs: {
    <%= h.changeCase.pascalCase(name) %>: {
      type: "object",
      properties: {
        title: {
          type: "string",
          maxLength: 200,
        },
        description: {
          type: "string",
        },
        image: {
          type: "string",
          format: "uri",
        },
      },
    },
  },
};

export const schema = extendDefinitionsWithProperties(
  rawSchema,
  () => schemaExpander.additionalProperties,
  undefined,
  schemaExpander.options,
);
