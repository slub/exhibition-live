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
  return ["_type", "_id"];
};

export const extendSchema = (schema: any): JSONSchema7 => {
  const excludeTypes = [];
  const definitionsWithJSONLDProperties = Object.entries(defs(schema)).reduce<
    JSONSchema7["definitions"]
  >((acc, [key, value]) => {
    return excludeTypes?.includes(key)
      ? { ...acc, [key]: value }
      : {
          ...acc,
          [key]: extendDefinitionsWithProperties(
            key,
            value as JSONSchema7,
            jsonldSemanticPropertiesFunction,
            genRequiredProperties,
          ),
        };
  }, {}) as JSONSchema7["definitions"];
  const definitionsKey = getDefintitionKey(schema);
  return {
    ...schema,
    [definitionsKey]: {
      ...definitionsWithJSONLDProperties,
    },
  };
};
