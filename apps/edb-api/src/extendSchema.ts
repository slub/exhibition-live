import { JSONSchema7 } from "json-schema";
import {
  GeneratePropertiesFunction,
  extendDefinitionsWithProperties,
} from "@slub/json-schema-utils";
const makeTypeAndIDProperties: GeneratePropertiesFunction = (
  _modelName: string,
) => ({
  _type: {
    type: "string",
  },
  _id: {
    type: "string",
  },
});

const genRequiredProperties = (_modelName: string) => {
  return ["_type", "_id"];
};

export const extendSchema = (schema: any): JSONSchema7 => {
  const excludeType = ["AuthorityEntry"];

  return extendDefinitionsWithProperties(
    schema,
    makeTypeAndIDProperties,
    genRequiredProperties,
    {
      excludeType,
    },
  );
};
