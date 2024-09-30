import { JSONSchema7 } from "json-schema";
import { defs, isJSONSchema } from "./jsonSchema";

const propertyExists = (
  property: string,
  restPath: string[],
  schema: JSONSchema7,
  rootSchema: JSONSchema7,
) => {
  if (restPath.length === 0) {
    return property in (schema.properties || {});
  }
  const nextSchema = schema.properties?.[property];
  if (nextSchema && isJSONSchema(nextSchema) && nextSchema.properties) {
    return propertyExists(
      restPath[0],
      restPath.slice(1),
      nextSchema,
      rootSchema,
    );
  }
  return false;
};
export const propertyExistsWithinSchema = (
  typeName: string,
  propertyPath: string,
  schema: JSONSchema7,
) => {
  const path = propertyPath.split(".");
  const nextSchema = defs(schema)[typeName];
  return propertyExists(
    path[0],
    path.slice(1),
    nextSchema as JSONSchema7,
    schema,
  );
};
