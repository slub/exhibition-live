import { JSONSchema7, JSONSchema7Definition } from "json-schema";

/**
 * Checks if the given JSON schema definition is not a boolean.
 *
 * @param {JSONSchema7Definition} json - The JSON schema definition to check.
 * @returns {boolean} True if the definition is not a boolean, indicating it is a JSONSchema7 object.
 */
export const isJSONSchema = (
  json: JSONSchema7Definition,
): json is JSONSchema7 => typeof json !== "boolean";
/**
 * Checks if the given input is a JSONSchema7Definition but not an array of them.
 *
 * @param {JSONSchema7Definition | JSONSchema7Definition[] | undefined} json - The input to check.
 * @returns {boolean} True if the input is a JSONSchema7Definition and not an array.
 */
export const isJSONSchemaDefinition = (
  json: JSONSchema7Definition | JSONSchema7Definition[] | undefined,
): json is JSONSchema7Definition => Boolean(json && !Array.isArray(json));
/**
 * Determines if the given type is a primitive type.
 *
 * @param {string | undefined} type - The type to check.
 * @returns {boolean} True if the type is a primitive type.
 */
export const isPrimitive = (type?: string) =>
  type === "string" ||
  type === "number" ||
  type === "integer" ||
  type === "boolean";

/**
 * Filters an object of JSONSchema7 properties for those that are primitive types or arrays of primitive types.
 *
 * @param {JSONSchema7["properties"]} properties - The properties to filter.
 * @returns {object} An object containing only the properties that are primitive types or arrays of primitive types.
 */
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
/**
 * Removes properties that are of primitive types from an object of JSONSchema7 properties.
 *
 * @param {JSONSchema7["properties"]} properties - The properties to filter out.
 * @returns {object} An object containing only the properties that are not primitive types.
 */
export const removePrimitiveProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        !(typeof value === "object" && isPrimitive(String(value.type))),
    ),
  );
/**
 * Filters an object of JSONSchema7 properties for those that are primitive types.
 *
 * @param {JSONSchema7["properties"]} properties - The properties to filter.
 * @returns {object} An object containing only the properties that are primitive types.
 */
export const filterForPrimitiveProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        typeof value === "object" &&
        value.type !== "object" &&
        (isPrimitive(String(value.type)) ||
          value.oneOf ||
          (value.type === "array" &&
            typeof value.items === "object" &&
            isPrimitive(String((value.items as any).type)))),
    ),
  );
/**
 * Filters an object of JSONSchema7 properties for those that are arrays.
 *
 * @param {JSONSchema7["properties"]} properties - The properties to filter.
 * @returns {object} An object containing only the properties that are arrays.
 */
export const filterForArrayProperties = (
  properties: JSONSchema7["properties"],
) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) => typeof value === "object" && value.type === "array",
    ),
  );
/**
 * Moves a specific definition to the top of the JSON schema object.
 *
 * Example:
 *
 * ```javascript
 * const schema = {
 *  definitions: {
 *    name: { type: "string" },
 *    age: { type: "number" },
 *  },
 *  type: "object",
 *  properties: {
 *    name: { $ref: "#/definitions/name" },
 *    age: { $ref: "#/definitions/age" },
 *  },
 *  required: ["name", "age"],
 *  };
 *  const newSchema = bringDefinitionToTop(schema, "age");
 *  console.log(newSchema);
 *  // {
 *  //  type: "object",
 *  //  properties: {
 *  //  name: { $ref: "#/definitions/name" },
 *  //  age: { $ref: "#/definitions/age" },
 *  //  },
 *  //  required: ["name", "age"],
 *  //  definitions: {
 *  //  age: { type: "number" },
 *  //  name: { type: "string" },
 *  //  },
 *  // }
 *  ```
 *
 *
 * @param {JSONSchema7} schema - The JSON schema to modify.
 * @param {string} name - The name of the definition to move to the top.
 * @returns {JSONSchema7} A new JSON schema object with the specified definition moved to the top.
 */
export const bringDefinitionToTop: (
  schema: JSONSchema7,
  name: string,
) => JSONSchema7 = (schema, name) => {
  const definitions = defs(schema);
  const specificModel = (definitions?.[name] as object | undefined) || {};
  return {
    ...schema,
    ...specificModel,
  } as JSONSchema7;
};

/**
 * Returns the key used for definitions in the given JSON schema.
 * If no definitions key is found, the default key "definitions" is returned.
 * @param schema
 */
export const getDefintitionKey = (schema: JSONSchema7) =>
  "$defs" in schema ? "$defs" : "definitions";

/**
 * Returns the definitions object from the given JSON schema or an empty object if it does not exist.
 * @param schema
 */
export const defs: (
  schema: JSONSchema7,
) => NonNullable<JSONSchema7["definitions"]> = (schema: JSONSchema7) =>
  schema.$defs || schema.definitions || {};
