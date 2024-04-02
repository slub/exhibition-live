import { JSONSchema4, JSONSchema7, JSONSchema7Definition } from "json-schema";
import {
  defs,
  isJSONSchema,
  isJSONSchemaDefinition,
  isPrimitive,
} from "@slub/json-schema-utils";
import { resolveSchema } from "@slub/edb-graph-traversal";
import { filterUndefOrNull } from "@slub/edb-core-utils";

type JsonSchema2PrismaSelectOptions = {
  exclude?: string[];
  maxRecursion?: number;
};
export const jsonSchema2PrismaSelect = (
  typeName: string,
  schema: JSONSchema7,
  options?: JsonSchema2PrismaSelectOptions,
) => {
  const definitions = defs(schema);
  const selectedSchema = definitions[typeName];
  if (!selectedSchema || !isJSONSchema(selectedSchema)) {
    throw new Error(`Type ${typeName} not found in schema`);
  }
  return jsonSchema2PrismaSelectProperties(
    typeName,
    schema,
    selectedSchema,
    options,
  );
};

export type JsonSchema = JSONSchema7 | JSONSchema4;

type SubSelectResult = {
  select: SelectResult;
};

type SelectResult = Record<string, boolean | SubSelectResult>;
export const jsonSchema2PrismaSelectProperties = (
  typeName: string,
  rootSchema: JSONSchema7,
  schema: JSONSchema7,
  options?: JsonSchema2PrismaSelectOptions,
  level: number = 0,
  prefix: string = "",
): SelectResult | null => {
  if (level > (options?.maxRecursion || 2)) {
    return null;
  }
  const allPropsCollected = filterUndefOrNull(
    Object.entries(schema.properties || {}).map(([property, subSchema]) => {
      const propName = `${prefix}${property}`;
      if (isJSONSchema(subSchema)) {
        if (typeof subSchema.type === "string" && isPrimitive(subSchema.type)) {
          return [propName, true];
        }
        if (
          typeof subSchema.$ref === "string" ||
          (isJSONSchemaDefinition(subSchema.items) &&
            isJSONSchema(subSchema.items) &&
            Boolean(subSchema.items.$ref))
        ) {
          const ref = subSchema.$ref || (subSchema.items as any)?.$ref;
          const realSubSchema = subSchema.$ref ? subSchema : subSchema.items;
          if (!ref) {
            return null;
          }
          const subSubSchema = resolveSchema(
            realSubSchema as JsonSchema,
            "",
            rootSchema as JsonSchema,
          ) as JSONSchema7Definition;
          const subTypeName = ref.split("/").pop();
          if (
            subSubSchema &&
            isJSONSchemaDefinition(subSubSchema) &&
            isJSONSchema(subSubSchema)
          ) {
            const subProperties = jsonSchema2PrismaSelectProperties(
              subTypeName,
              rootSchema,
              subSubSchema as JSONSchema7,
              options,
              level + 1,
            );
            if (!subProperties) {
              return null;
            }
            return [
              propName,
              {
                select: subProperties,
              },
            ];
          }
        }
      }
      return null;
    }),
  );
  const additionalPropsCollected = filterUndefOrNull(
    Object.entries(schema.properties || {}).map(([property, subSchema]) => {
      const propName = `${prefix}${property}`;
      if (isJSONSchema(subSchema)) {
        if (subSchema.type === "object" && subSchema.properties) {
          const subProperties = jsonSchema2PrismaSelectProperties(
            typeName,
            rootSchema,
            subSchema,
            options,
            level + 1,
            `${propName}_`,
          );
          if (!subProperties) {
            return null;
          }
          return subProperties;
        }
      }
    }),
  );
  const additionalPropsCollectedFlattened = additionalPropsCollected.reduce(
    (acc, curr) => {
      return { ...acc, ...curr };
    },
    {},
  );
  return allPropsCollected.length > 0
    ? Object.fromEntries([
        ...allPropsCollected,
        ...Object.entries(additionalPropsCollectedFlattened),
      ])
    : null;
};
