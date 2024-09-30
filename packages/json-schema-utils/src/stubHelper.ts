import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import isObject from "lodash/isObject";
import { defs, getDefintitionKey } from "./jsonSchema";

export type GenRequiredPropertiesFunction = (modelName: string) => string[];
export type GeneratePropertiesFunction = (
  modelName: string,
) => JSONSchema7["properties"];
export const filterForPrimitives = (properties: JSONSchema7["properties"]) =>
  Object.fromEntries(
    Object.entries(properties || {}).filter(
      ([, value]) =>
        typeof value === "object" &&
        (value.type === "string" ||
          value.type === "number" ||
          value.type === "integer" ||
          value.oneOf ||
          value.type === "boolean"),
    ),
  );

export type RefAppendOptions = {
  excludeType?: string[];
  excludeField?: string[];
  excludeSemanticPropertiesForType?: string[];
};

export type SchemaExpander = {
  additionalProperties: Record<string, JSONSchema7Definition>;
  options: RefAppendOptions;
};
export const recursivelyFindRefsAndAppendStub: (
  field: string,
  schema: JSONSchema7,
  options: RefAppendOptions,
  rootSchema?: JSONSchema7,
  isProperty?: boolean,
) => JSONSchema7 = (
  field,
  schema: JSONSchema7,
  options,
  rootSchema = schema,
  isProperty = false,
) => {
  if (options?.excludeField?.includes(field)) {
    return schema;
  }
  const definitionsKey = getDefintitionKey(rootSchema);
  if (schema.$ref) {
    if (
      options?.excludeType?.includes(
        schema.$ref.substring(
          `#/${definitionsKey}/`.length,
          schema.$ref.length,
        ),
      )
    ) {
      return schema;
    }
    return {
      ...schema,
      $ref: `${schema.$ref}Stub`,
    };
  }
  if (isObject(schema.items)) {
    return {
      ...schema,
      items: recursivelyFindRefsAndAppendStub(
        field,
        schema.items as JSONSchema7,
        options,
        rootSchema,
      ),
    };
  }
  if (schema.properties) {
    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(
          ([k, s]) =>
            [
              k,
              recursivelyFindRefsAndAppendStub(
                k,
                s as JSONSchema7,
                options,
                rootSchema,
                true,
              ),
            ] as [string, JSONSchema7Definition],
          options,
        ),
      ),
    };
  }
  if (defs(schema) && !isProperty) {
    return {
      ...schema,
      [definitionsKey]: Object.fromEntries(
        Object.entries(defs(schema)).map(
          ([k, s]) =>
            [
              k,
              recursivelyFindRefsAndAppendStub(
                k,
                s as JSONSchema7,
                options,
                rootSchema,
              ),
            ] as [string, JSONSchema7Definition],
          options,
        ),
      ),
    };
  }
  return schema;
};

export const definitionsToStubDefinitions = (
  definitions: JSONSchema7["definitions"],
  options?: RefAppendOptions,
) =>
  Object.entries(definitions || {}).reduce((acc, [key, value]) => {
    if (options?.excludeType?.includes(key))
      return {
        ...acc,
        [key]: value,
      };
    const stubKey = `${key}Stub`;
    const stub = {
      ...(isObject(value) ? value : {}),
      properties: isObject(value)
        ? filterForPrimitives((value as any)?.properties)
        : undefined,
    };
    return {
      ...acc,
      [stubKey]: stub,
    };
  }, {}) as JSONSchema7["definitions"];

/**
 * extend Properties for a particular type, expects schema to have a properties key, thus it will not touch the definitions
 *
 * @param typeName
 * @param schema
 * @param generateSemanticProperties
 * @param requiredProperties
 */
export const extendProperties: (
  typeName: string,
  schema: JSONSchema7,
  generateSemanticProperties?: GeneratePropertiesFunction,
  requiredProperties?: GenRequiredPropertiesFunction,
) => JSONSchema7 = (
  typeName,
  schema,
  generateSemanticProperties,
  requiredProperties,
) =>
  ({
    ...schema,
    properties: {
      ...schema.properties,
      ...(generateSemanticProperties
        ? generateSemanticProperties(typeName)
        : {}),
    },
    ...(requiredProperties ? { required: requiredProperties(typeName) } : {}),
  }) as JSONSchema7;

/**
 * Extends the definitions of a JSON schema with additional properties.
 * Can be used to add @id and @type properties or others, like meta properties.
 *
 * @param schema the schema to extend
 * @param generateSemanticProperties a function that generates the properties for a given model name (key in the definitions part of the schema)
 * @param requiredProperties a function that generates the required properties for a given model name
 * @param options options to exclude certain types or fields from being extended
 */
export const extendDefinitionsWithProperties: (
  schema: JSONSchema7,
  generateSemanticProperties?: GeneratePropertiesFunction,
  requiredProperties?: GenRequiredPropertiesFunction,
  options?: RefAppendOptions,
) => JSONSchema7 = (
  schema,
  generateSemanticProperties,
  requiredProperties,
  options,
) => {
  const newDefs = Object.entries(defs(schema)).reduce<
    JSONSchema7["definitions"]
  >((acc, [key, value]) => {
    return options?.excludeSemanticPropertiesForType?.includes(key)
      ? { ...acc, [key]: value }
      : {
          ...acc,
          [key]: extendProperties(
            key,
            value as JSONSchema7,
            generateSemanticProperties,
            requiredProperties,
          ),
        };
  }, {}) as JSONSchema7["definitions"];
  return {
    ...schema,
    [getDefintitionKey(schema)]: newDefs,
  } as JSONSchema7;
};
export const prepareStubbedSchema = (
  schema: JSONSchema7,
  genJSONLDSemanticProperties?: GeneratePropertiesFunction,
  requiredProperties?: GenRequiredPropertiesFunction,
  options?: RefAppendOptions,
) => {
  const definitionsKey = getDefintitionKey(schema);

  const stubDefinitions = definitionsToStubDefinitions(defs(schema), options);
  const schemaWithRefStub = recursivelyFindRefsAndAppendStub(
    "root",
    schema,
    options || {},
    schema,
  );

  const stubbedSchema = {
    ...schemaWithRefStub,
    [definitionsKey]: {
      ...stubDefinitions,
      ...schemaWithRefStub[definitionsKey],
    },
  };

  return extendDefinitionsWithProperties(
    stubbedSchema,
    genJSONLDSemanticProperties,
    requiredProperties,
    options,
  );
};
