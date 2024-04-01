import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import isObject from "lodash/isObject";
import { defs, getDefintitionKey } from "./jsonSchema";

export type GenRequiredPropertiesFunction = (modelName: string) => string[];
export type GenJSONLDSemanticPropertiesFunction = (
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

type RefAppendOptions = {
  excludeType?: string[];
  excludeField?: string[];
  excludeSemanticPropertiesForType?: string[];
};

export const recursivelyFindRefsAndAppendStub: (
  field: string,
  schema: JSONSchema7,
  options: RefAppendOptions,
  rootSchema?: JSONSchema7,
) => JSONSchema7 = (
  field,
  schema: JSONSchema7,
  options,
  rootSchema = schema,
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
              ),
            ] as [string, JSONSchema7Definition],
          options,
        ),
      ),
    };
  }
  if (defs(schema)) {
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

export const withJSONLDProperties: (
  name: string,
  schema: JSONSchema7,
  genJSONLDSemanticProperties?: GenJSONLDSemanticPropertiesFunction,
  requiredProperties?: GenRequiredPropertiesFunction,
) => JSONSchema7 = (
  name,
  schema,
  genJSONLDSemanticProperties,
  requiredProperties,
) =>
  ({
    ...schema,
    properties: {
      ...schema.properties,
      ...(genJSONLDSemanticProperties ? genJSONLDSemanticProperties(name) : {}),
    },
    required: requiredProperties ? requiredProperties(name) : undefined,
  }) as JSONSchema7;

export const prepareStubbedSchema = (
  schema: JSONSchema7,
  genJSONLDSemanticProperties?: GenJSONLDSemanticPropertiesFunction,
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

  const definitionsWithJSONLDProperties = Object.entries(
    defs(stubbedSchema),
  ).reduce<JSONSchema7["definitions"]>((acc, [key, value]) => {
    return options?.excludeSemanticPropertiesForType?.includes(key)
      ? { ...acc, [key]: value }
      : {
          ...acc,
          [key]: withJSONLDProperties(
            key,
            value as JSONSchema7,
            genJSONLDSemanticProperties,
            requiredProperties,
          ),
        };
  }, {}) as JSONSchema7["definitions"];

  const stubbedSemanticSchema: JSONSchema7 = {
    ...stubbedSchema,
    [definitionsKey]: definitionsWithJSONLDProperties,
  };

  return stubbedSemanticSchema;
};
