import { JsonSchema, UISchemaElement } from "@jsonforms/core";

/**
 * Convert a JSON Schema to a list of UI Schema elements
 * this is very usefull if you either do not have a specific UI Schema
 * or if you want to generate a UI Schema from a JSON Schema and "fill the gaps"
 * of elements that are not defined in the UI Schema
 * @param jsonschema
 * @param subpath
 */
export const jsonSchema2UISchemaElements: (
  jsonschema: JsonSchema,
  subpath?: string,
) => UISchemaElement[] = (jsonschema: JsonSchema, subpath) => {
  const uiSchemaElements: UISchemaElement[] = Object.keys(
    jsonschema.properties || {},
  ).map((k) => ({
    type: "Control",
    scope: `#/properties/${subpath || ""}${k}`,
  }));
  return uiSchemaElements;
};
