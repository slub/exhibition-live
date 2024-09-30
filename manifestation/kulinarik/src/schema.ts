import { JSONSchema7 } from "json-schema";
import { extendDefinitionsWithProperties } from "@slub/json-schema-utils";
import { schemaExpander } from "./makeStubSchema";

export const schemaName = "kulinarik";

const rawSchema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://schema.adb.arthistoricum.net/kulinarik#v1",
  title: "SLUB kulinarik Datenbank",
  $defs: {
    Person: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 200,
        },
        birthDate: {
          type: "string",
          format: "date",
        },
        deathDate: {
          type: "string",
          format: "date",
        },
        description: {
          type: "string",
        },
        image: {
          type: "string",
          format: "uri",
        },
        sameAs: {
          type: "string",
          format: "uri",
        },
      },
    },
    Kulinarik: {
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
        authoredBy: {
          $ref: "#/$defs/Person",
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
