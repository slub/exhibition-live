import { JSONSchema7 } from "json-schema";

export const addressSchema: JSONSchema7 = {
  $defs: {
    Address: {
      type: "object",
      properties: {
        addressCountry: {
          type: "string",
        },
        addressRegion: {
          type: "string",
        },
        postalCode: {
          type: "string",
        },
        streetAddress: {
          type: "string",
        },
      },
    },
    Person: {
      title: "Person",
      description: "A human being",
      type: "object",
      properties: {
        familyName: {
          type: "string",
        },
        givenName: {
          type: "string",
        },
        child: {
          type: "array",
          items: {
            $ref: "#/$defs/Person",
          },
        },
        knows: {
          type: "array",
          items: {
            $ref: "#/$defs/Person",
          },
        },
        address: {
          $ref: "#/$defs/Address",
        },
      },
    },
  },
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://example.com/person.schema.json",
};
