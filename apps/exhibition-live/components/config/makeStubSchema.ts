import { JSONSchema7 } from "json-schema";
import {
  GenJSONLDSemanticPropertiesFunction,
  prepareStubbedSchema,
} from "@slub/json-schema-utils";

const makeGenSlubJSONLDSemanticProperties: (
  baseIRI: string,
  entitytBaseIRI: string,
) => GenJSONLDSemanticPropertiesFunction =
  (baseIRI: string, entityBaseIRI: string) => (modelName: string) => ({
    "@type": {
      const: `${baseIRI}${modelName.replace(/Stub$/, "")}`,
      type: "string",
    },
    "@id": {
      title: entityBaseIRI,
      type: "string",
    },
    idAuthority: {
      title: "Autorität",
      type: "object",
      properties: {
        "@id": {
          title: "IRI",
          type: "string",
        },
      },
    },
  });

const genSlubJSONLDSemanticProperties = makeGenSlubJSONLDSemanticProperties(
  "http://ontologies.slub-dresden.de/exhibition#",
  "http://ontologies.slub-dresden.de/exhibition/entity/",
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
    {
      excludeType: ["InvolvedPerson", "InvolvedCorporation", "AuthorityEntry"],
      excludeSemanticPropertiesForType: ["AuthorityEntry"],
    },
  );
};
