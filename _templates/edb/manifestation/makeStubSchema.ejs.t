---
to: manifestation/<%= name %>/src/makeStubSchema.ts
---
import { JSONSchema7 } from "json-schema";
import {
  GeneratePropertiesFunction,
  prepareStubbedSchema,
  SchemaExpander,
} from "@slub/json-schema-utils";

export const schemaExpander: SchemaExpander = {
  additionalProperties: {
    idAuthority: {
      title: "Normdatenbeziehung",
      type: "object",
      properties: {
        authority: {
          title: "Autorität",
          type: "string",
          format: "uri",
        },
        id: {
          title: "IRI",
          type: "string",
          format: "uri",
        },
      },
    },
  },
  options: {
    excludeType: [],
    excludeSemanticPropertiesForType: ["AuthorityEntry"],
  },
};
const makeGenSlubJSONLDSemanticProperties: (
  baseIRI: string,
  entitytBaseIRI: string,
) => GeneratePropertiesFunction =
  (baseIRI: string, entityBaseIRI: string) => (modelName: string) => ({
    "@type": {
      const: `${baseIRI}${modelName.replace(/Stub$/, "")}`,
      type: "string",
    },
    "@id": {
      title: entityBaseIRI,
      type: "string",
    },
  });

const genSlubJSONLDSemanticProperties = makeGenSlubJSONLDSemanticProperties(
  "http://ontologies.slub-dresden.de/<%= h.changeCase.paramCase(name) %>#",
  "http://ontologies.slub-dresden.de/<%= h.changeCase.paramCase(name) %>/entity/",
);
const genSlubRequiredProperties = (_modelName: string) => {
  return ["@type", "@id"];
};
export const makeStubSchema: (schema: JSONSchema7) => JSONSchema7 = (
  schema,
) => {
  return prepareStubbedSchema(
    schema,
    genSlubJSONLDSemanticProperties,
    genSlubRequiredProperties,
    schemaExpander.options,
  );
};
