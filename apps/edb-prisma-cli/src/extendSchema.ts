import namespace from "@rdfjs/namespace";
import { JSONSchema7 } from "json-schema";
import {
  defs,
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
    type: {
      const: `${baseIRI}${modelName}`,
      type: "string",
    },
    id: {
      title: entityBaseIRI,
      type: "string",
    },
  });

const jsonldSemanticPropertiesFunction = makeSemanticProperties(
  sladb[""].value,
  slent[""].value,
);
const genRequiredProperties = (_modelName: string) => {
  return ["type", "id"];
};

export const extendSchema = (schema: any): JSONSchema7 => {
  const excludeTypes = ["AuthorityEntry"];
  const definitionsWithJSONLDProperties = Object.entries(defs(schema)).reduce<
    JSONSchema7["definitions"]
  >((acc, [key, value]) => {
    return excludeTypes?.includes(key)
      ? { ...acc, [key]: value }
      : {
          ...acc,
          [key]: withJSONLDProperties(
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
