import { JSONSchema7, JSONSchema7Definition } from "json-schema";

export const isJSONSchema = (
  json: JSONSchema7Definition,
): json is JSONSchema7 => typeof json !== "boolean";
export const isJSONSchemaDefinition = (
  json: JSONSchema7Definition | JSONSchema7Definition[] | undefined,
): json is JSONSchema7Definition => Boolean(json && !Array.isArray(json));

export const isPrimitive = (type?: string) =>
  type === "string" ||
  type === "number" ||
  type === "integer" ||
  type === "boolean";
export const filterForPrimitivePropertiesAndArrays = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        typeof value === "object" &&
        (isPrimitive(String(value.type)) ||
          value.oneOf ||
          (value.type === "array" &&
            typeof value.items === "object" &&
            isPrimitive(String((value.items as any).type)))),
    ),
  );
export const removePrimitiveProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        !(typeof value === "object" && isPrimitive(String(value.type))),
    ),
  );

export const filterForPrimitiveProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        typeof value === "object" &&
        (isPrimitive(String(value.type)) ||
          value.oneOf ||
          (value.type === "array" &&
            typeof value.items === "object" &&
            isPrimitive(String((value.items as any).type)))),
    ),
  );
export const filterForArrayProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) => typeof value === "object" && value.type === "array",
    ),
  );

export const bringDefinitionToTop = (schema: JSONSchema7, name) => {
  const defsFieldName = schema.definitions ? "definitions" : "$defs";
  const specificModel =
    (schema[defsFieldName]?.[name] as object | undefined) || {};
  return {
    ...schema,
    ...specificModel
  }
}
