import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { PrimaryField, PrimaryFieldDeclaration } from "@slub/edb-core-types";
import {
  defs,
  isJSONSchema,
  isJSONSchemaDefinition,
  isPrimitive,
  resolveSchema,
} from "@slub/json-schema-utils";
import { JsonSchema } from "./jsonSchema2PrismaSelect";
import { filterUndefOrNull } from "@slub/edb-core-utils";

type JsonSchema2PrismaFlatSelectOptions = {
  takeLimit: number;
  includeAttributes?: boolean;
  exclude?: string[];
};
export const jsonSchema2PrismaFlatSelect = (
  typeName: string,
  schema: JSONSchema7,
  primaryFields: PrimaryFieldDeclaration,
  options?: JsonSchema2PrismaFlatSelectOptions,
  prefix: string = "",
): any => {
  const definitions = defs(schema);
  const selectedSchema = definitions[typeName];
  if (!selectedSchema || !isJSONSchema(selectedSchema)) {
    throw new Error(`Type ${typeName} not found in schema`);
  }

  return {
    include: jsonSchema2PrismaFlatSelectProperties(
      typeName,
      schema,
      selectedSchema,
      primaryFields,
      options,
      prefix,
    ),
  };
};
const jsonSchema2PrismaFlatSelectProperties = (
  typeName: string,
  rootSchema: JSONSchema7,
  schema: JSONSchema7,
  primaryFields: PrimaryFieldDeclaration,
  options?: JsonSchema2PrismaFlatSelectOptions,
  prefix: string = "",
): any => {
  const countItems: string[] = [];
  //iterate over all properties
  const selectPartArray = filterUndefOrNull(
    Object.entries(schema.properties || {}).map(([property, subSchema]) => {
      const propName = `${prefix}${property}`;
      if (isJSONSchema(subSchema)) {
        if (
          typeof subSchema.type === "string" &&
          isPrimitive(subSchema.type) &&
          options?.includeAttributes
        ) {
          //replace leading @
          return [propName.replace(/^@/, ""), true];
        } else if (typeof subSchema.$ref === "string") {
          const ref = subSchema.$ref,
            subTypeName = ref.split("/").pop(),
            subSubSchema = resolveSchema(
              subSchema as JsonSchema,
              "",
              rootSchema as JsonSchema,
            ) as JSONSchema7Definition;
          if (
            subTypeName &&
            subSubSchema &&
            isJSONSchemaDefinition(subSubSchema) &&
            isJSONSchema(subSubSchema)
          ) {
            const primaryField = primaryFields[subTypeName] as PrimaryField;
            if (primaryField?.label) {
              return [
                propName,
                {
                  select: {
                    id: true,
                    [primaryField.label]: true,
                  },
                },
              ];
            }
          }
        } else if (
          isJSONSchemaDefinition(subSchema.items) &&
          isJSONSchema(subSchema.items) &&
          typeof subSchema.items.$ref === "string"
        ) {
          const ref = subSchema.items.$ref,
            subTypeName = ref.split("/").pop(),
            subSubSchema = resolveSchema(
              subSchema.items as JsonSchema,
              "",
              rootSchema as JsonSchema,
            ) as JSONSchema7Definition;

          if (
            subTypeName &&
            subSubSchema &&
            isJSONSchemaDefinition(subSubSchema) &&
            isJSONSchema(subSubSchema)
          ) {
            const primaryField = primaryFields[subTypeName] as PrimaryField;
            if (primaryField?.label) {
              countItems.push(propName);
              return [
                propName,
                {
                  ...(options?.takeLimit ? { take: options.takeLimit } : {}),
                  select: {
                    id: true,
                    [primaryField.label]: true,
                  },
                },
              ];
            }
          }
        }
      }
    }),
  );
  const query = {
    ...Object.fromEntries(selectPartArray),
    ...(countItems.length > 0
      ? {
          _count: {
            select: Object.fromEntries(countItems.map((item) => [item, true])),
          },
        }
      : {}),
  };
  return query;
};
