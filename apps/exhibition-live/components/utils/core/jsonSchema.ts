import { JSONSchema7, JSONSchema7Definition } from "json-schema";

export const isJSONSchema = (
  json: JSONSchema7Definition,
): json is JSONSchema7 => typeof json !== "boolean";
export const isJSONSchemaDefinition = (
  json: JSONSchema7Definition | JSONSchema7Definition[] | undefined,
): json is JSONSchema7Definition => Boolean(json && !Array.isArray(json));
