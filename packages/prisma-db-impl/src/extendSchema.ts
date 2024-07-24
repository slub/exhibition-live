import namespace from "@rdfjs/namespace";
import { JSONSchema7 } from "json-schema";
import {
  defs,
  extendDefinitionsWithProperties,
  GeneratePropertiesFunction,
  getDefintitionKey,
} from "@slub/json-schema-utils";

export const sladb = namespace("http://ontologies.slub-dresden.de/exhibition#");
export const slent = namespace(
  "http://ontologies.slub-dresden.de/exhibition/entity#",
);
const makeSemanticProperties: (
  baseIRI: string,
  entitytBaseIRI: string,
) => GeneratePropertiesFunction =
  (baseIRI: string, entityBaseIRI: string) => (modelName: string) => ({
    "@type": {
      const: `${baseIRI}${modelName}`,
      type: "string",
    },
    "@id": {
      title: entityBaseIRI,
      type: "string",
    },
  });

const jsonldSemanticPropertiesFunction = makeSemanticProperties(
  sladb[""].value,
  slent[""].value,
);
const genRequiredProperties = (_modelName: string) => {
  return ["@type", "@id"];
};

export const extendSchema = (schema: any): JSONSchema7 => {
  return extendDefinitionsWithProperties(
    schema,
    jsonldSemanticPropertiesFunction,
    genRequiredProperties,
  );
};
