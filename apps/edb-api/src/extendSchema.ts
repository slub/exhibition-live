import namespace from "@rdfjs/namespace";
import {
  GenJSONLDSemanticPropertiesFunction,
  prepareStubbedSchema,
} from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import {
  defs,
  getDefintitionKey,
  withJSONLDProperties,
} from "@slub/json-schema-utils";

export const sladb = namespace("http://ontologies.slub-dresden.de/exhibition#");
export const slent = namespace(
  "http://ontologies.slub-dresden.de/exhibition/entity#",
);
const makeGenSlubJSONLDSemanticProperties: (
  baseIRI: string,
  entitytBaseIRI: string,
) => GenJSONLDSemanticPropertiesFunction =
  (baseIRI: string, entityBaseIRI: string) => (modelName: string) => ({
    _type: {
      const: `${baseIRI}${modelName}`,
      type: "string",
    },
    _id: {
      title: entityBaseIRI,
      type: "string",
    },
  });

const jsonldSemanticPropertiesFunction = makeGenSlubJSONLDSemanticProperties(
  sladb[""].value,
  slent[""].value,
);
const genSlubRequiredProperties = (_modelName: string) => {
  return ["_type", "_id"];
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
            genSlubRequiredProperties,
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
