import {
  defs,
  isJSONSchema,
  isJSONSchemaDefinition,
  isPrimitive,
} from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";

const primitiveToPrisma = (type: string): string => {
  switch (type) {
    case "string":
      return "String";
    case "number":
      return "Float";
    case "integer":
      return "Int";
    case "boolean":
      return "Boolean @default(false)";
    default:
      return "String";
  }
};

const prefixed = (prefix: string, name: string): string => `${prefix}${name}`;

/**
 * will generate the n2m table for a given schema
 * @param typeName the name of the type
 * @param properties the properties object
 * @param visited a weakset to keep track of visited types
 * @param prefix the prefix for the properties
 */
export const n2MTable = (
  typeName: string,
  properties: JSONSchema7["properties"] = {},
  visited: WeakSet<any>,
  prefix: string = "",
): any => {
  return Object.entries(properties)
    .map(([propName, propSchema]) => {
      const pp = prefixed(prefix, propName);
      if (isJSONSchema(propSchema)) {
        if (propSchema.items) {
          if (
            isJSONSchemaDefinition(propSchema.items) &&
            isJSONSchema(propSchema.items) &&
            propSchema.items.properties
          ) {
            const n2m = n2MTable(
              `${typeName}_${propName}`,
              propSchema.items.properties,
              visited,
              `${pp}_`,
            );
            return `model ${typeName}_${propName} {\n${propertiesToPrisma(typeName, propSchema.items.properties, visited, "", `${propName}_`)}\n}\n${n2m}`;
          }
        }
      }
      return "";
    })
    .join("\n");
};

const replaceAt = (str: string) => str.replace("@", "_");

/**
 * will generate the prisma properties for a given schema based on the properties object
 *
 * @param typeName the name of the type, will be used as prefix for the properties
 * @param properties the properties object
 * @param visited a weakset to keep track of visited types
 * @param prefix the prefix for the properties
 * @param propPrefix the prefix for the properties of the properties
 * @returns the string which contains the prisma properties for the given schema
 */
export const propertiesToPrisma = (
  typeName: string,
  properties: JSONSchema7["properties"] = {},
  visited: WeakSet<any>,
  prefix: string = "",
  propPrefix = "",
): string => {
  return Object.entries(properties)
    .map(([propName, propSchema]) => {
      const pp = prefixed(prefix, propName);
      if (isJSONSchema(propSchema)) {
        if (propSchema.$ref) {
          const type = propSchema.$ref.split("/").pop();
          return `${pp} ${type}`;
        }
        if (propSchema.items) {
          if (
            isJSONSchemaDefinition(propSchema.items) &&
            (propSchema.items as any).$ref
          ) {
            const type = (propSchema.items as any).$ref.split("/").pop();
            return `${pp} ${type}[]`;
          }
          if (
            isJSONSchemaDefinition(propSchema.items) &&
            isJSONSchema(propSchema.items) &&
            propSchema.items.properties
          ) {
            //do not create anything -> create a type
            return `${pp} ${typeName}_${propPrefix}${propName}[]`;
          }
        }
        if (propSchema.type && typeof propSchema.type === "string") {
          if (isPrimitive(propSchema.type)) {
            if (propSchema.type === "string" && propSchema.enum) {
              return `${pp} ${propSchema.enum.map((e: any) => `"${e}"`).join(" | ")}`;
            }
            if (
              propSchema.type === "string" &&
              propSchema.format === "date-time"
            ) {
              return `${pp} DateTime`;
            }
            if (propName === "@id" && propSchema.type === "string") {
              return `${replaceAt(propName)} String @id`;
            }
            if (propName.startsWith("@") && propSchema.type === "string") {
              return `${replaceAt(propName)} String`;
            }
            return `${pp} ${primitiveToPrisma(propSchema.type)}`;
          } else {
            if (propSchema.type === "object" && propSchema.properties) {
              if (propSchema.properties) {
                const prismaType = propertiesToPrisma(
                  typeName,
                  propSchema.properties,
                  visited,
                  `${pp}_`,
                );
                return `${prismaType}`;
              }
            }
          }
        }
      }
    })
    .join("\n");
};
export const jsonSchema2Prisma = (
  schema: JSONSchema7,
  visited: WeakSet<any>,
): string => {
  let result = "";
  if (isJSONSchema(schema)) {
    const definitions = defs(schema);
    if (schema.properties && schema.title) {
      const prismaType = propertiesToPrisma(
        schema.title,
        schema.properties,
        visited,
      );
      result += `model ${schema.title} {\n${prismaType}\n}\n`;
    }
    result += Object.entries(definitions)
      .map(([typeName, typeSchema]) => {
        if (isJSONSchema(typeSchema) && typeSchema.properties) {
          const prismaType = propertiesToPrisma(
            typeName,
            typeSchema.properties,
            visited,
          );
          const n2m = n2MTable(typeName, typeSchema.properties, visited);
          return `model ${typeName} {\n${prismaType}\n}${n2m}`;
        }
      })
      .join("\n");
  }
  return result;
};
