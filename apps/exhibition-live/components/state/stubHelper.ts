import { GenJSONLDSemanticPropertiesFunction } from "@graviola/crud-jsonforms";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import isObject from "lodash/isObject";

const filterForPrimitiveProperties = (properties: JSONSchema7["properties"]) =>
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
export const defs: (
  schema: JSONSchema7,
) => NonNullable<JSONSchema7["definitions"]> = (schema: JSONSchema7) =>
  schema.$defs || schema.definitions || {};

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
  const definitionsKey = "$defs" in rootSchema ? "$defs" : "definitions";
  if (schema.$ref) {
    if (
      options?.excludeType.includes(
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
        ? filterForPrimitiveProperties(value.properties)
        : undefined,
    };
    return {
      ...acc,
      [stubKey]: stub,
    };
  }, {}) as JSONSchema7["definitions"];

export const prepareStubbedSchema = (
  schema: JSONSchema7,
  genJSONLDSemanticProperties?: GenJSONLDSemanticPropertiesFunction,
  options?: RefAppendOptions,
) => {
  const definitionsKey = "$defs" in schema ? "$defs" : "definitions";

  const withJSONLDProperties: (
    name: string,
    schema: JSONSchema7,
  ) => JSONSchema7 = (name: string, schema: JSONSchema7) =>
    ({
      ...schema,
      properties: {
        ...schema.properties,
        ...(genJSONLDSemanticProperties
          ? genJSONLDSemanticProperties(name)
          : {}),
      },
    }) as JSONSchema7;

  const stubDefinitions = definitionsToStubDefinitions(defs(schema), options);
  const schemaWithRefStub = recursivelyFindRefsAndAppendStub(
    "root",
    schema,
    options,
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
          [key]: withJSONLDProperties(key, value as JSONSchema7),
        };
  }, {}) as JSONSchema7["definitions"];

  const stubbedSemanticSchema: JSONSchema7 = {
    ...stubbedSchema,
    [definitionsKey]: definitionsWithJSONLDProperties,
  };

  return stubbedSemanticSchema;
};
