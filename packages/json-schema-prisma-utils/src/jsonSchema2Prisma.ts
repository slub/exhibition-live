import {
  defs,
  isJSONSchema,
  isJSONSchemaDefinition,
  isPrimitive,
} from "@slub/json-schema-utils";
import { JSONSchema7 } from "json-schema";
import { schemaName } from "@slub/exhibition-schema/src";

const primitiveToPrisma = (type: string, requiredQM: string): string => {
  switch (type) {
    case "string":
      return `String${requiredQM}`;
    case "number":
      return `Float${requiredQM}`;
    case "integer":
      return `Int${requiredQM}`;
    case "boolean":
      return `Boolean${requiredQM} @default(false)`;
    default:
      return `String${requiredQM}`;
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
            return ""; // `model ${typeName}_${propName} {\n${propertiesToPrisma(typeName, propSchema.items.properties, visited, "", `${propName}_`)}\n}\n${n2m}`;
          }
        }
      }
      return "";
    })
    .join("\n");
};

const replaceAt = (str: string) => str.replace("@", "");

type PropertiesToPrismaReturnType = {
  directProperties: string[];
  externalComplementaryProperties: {
    tableName: string;
    property: string;
  }[];
};

type PropertiesToPrismaOptions = {
  reverseMap: Record<string, string>;
};

const direct = (prop: string): PropertiesToPrismaReturnType => ({
  directProperties: [prop],
  externalComplementaryProperties: [],
});

const combine = (
  properties: PropertiesToPrismaReturnType[],
): PropertiesToPrismaReturnType => {
  return {
    directProperties: properties.flatMap(
      ({ directProperties }) => directProperties,
    ),
    externalComplementaryProperties: properties.flatMap(
      (p) =>
        (p.externalComplementaryProperties ||
          []) as PropertiesToPrismaReturnType["externalComplementaryProperties"],
    ),
  };
};

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
  required: JSONSchema7["required"],
  visited: WeakSet<any>,
  prefix: string = "",
  propPrefix = "",
  options?: PropertiesToPrismaOptions,
): PropertiesToPrismaReturnType => {
  const qm = (propName: string) => (required?.includes(propName) ? "" : "?");
  return combine(
    Object.entries(properties).map(([propName, propSchema]) => {
      const pp = prefixed(prefix, propName);
      if (isJSONSchema(propSchema)) {
        if (propSchema.$ref) {
          const type = propSchema.$ref.split("/").pop();
          const reverseProperty =
            options?.reverseMap[pp] || `${pp}_to_${typeName}_reverse`;
          if (typeof type == "string" && type === typeName) {
            const result: PropertiesToPrismaReturnType = {
              directProperties: [
                `${pp}_id String${qm(propName)}`,
                `${pp} ${type}${qm(propName)}  @relation("${propName}", fields: [${pp}_id], references: [id])`,
              ],
              externalComplementaryProperties: [
                {
                  tableName: type,
                  property: `${reverseProperty} ${typeName}[] @relation("${propName}")`,
                },
              ],
            };
            return result;
          }
          return {
            directProperties: [
              `${pp}_id String${qm(propName)}`,
              `${pp} ${type}${qm(propName)}  @relation("${propName}", fields: [${pp}_id], references: [id])`,
            ],
            externalComplementaryProperties: [
              {
                tableName: type as string,
                property: `${reverseProperty} ${typeName}[] @relation("${propName}")`,
              },
            ],
          };
        }
        if (propSchema.items) {
          if (
            isJSONSchemaDefinition(propSchema.items) &&
            (propSchema.items as any).$ref
          ) {
            const reverseProperty =
              options?.reverseMap[pp] || `${pp}_to_${typeName}_reverse`;
            const type = (propSchema.items as any).$ref
              .split("/")
              .pop() as string;
            const relationName = `${typeName}_${pp}_${type}`;
            return {
              directProperties: [
                `${pp} ${type}[] @relation(name: "${relationName}")`,
              ],
              externalComplementaryProperties: [
                {
                  tableName: type,
                  property: `${reverseProperty} ${typeName}[] @relation(name: "${relationName}")`,
                },
              ],
            };
            /*
            const fieldFromName = type.toLocaleLowerCase()
            const fieldToName = typeName.toLocaleLowerCase()
            return {
              directProperties: [`${pp} ${type}[] @relation("${pp}")`],
              externalComplementaryProperties: [
                {
                  tableName: type,
                  property: `${reverseProperty} ${typeName}[] @relation("${pp}")`
                },
                  ...([
                    `${fieldFromName} ${type} @relation("${pp}", fields: [${fieldFromName}_id], references: [id])`,
                    `${fieldToName} ${typeName} @relation("${pp}", fields: [${fieldToName}_id], references: [id])`,
                    `${fieldFromName}_id String`,
                    `${fieldToName}_id String`,
                    `@@id([${fieldFromName}_id, ${fieldToName}_id])`
                  ].map(property => ({tableName: `${type}_${pp}_${typeName}`, property})))
              ]
            };
             */
          }
          if (
            isJSONSchemaDefinition(propSchema.items) &&
            isJSONSchema(propSchema.items) &&
            propSchema.items.properties
          ) {
            const subModel = propertiesToPrisma(
              typeName,
              propSchema.items.properties,
              propSchema.items.required,
              visited,
              "",
              `${propName}_`,
              options,
            );
            const result: PropertiesToPrismaReturnType = {
              directProperties: [
                `${pp} ${typeName}_${propPrefix}${propName}[]`,
              ],
              externalComplementaryProperties: [
                ...subModel.externalComplementaryProperties,
                ...subModel.directProperties.map((dp) => ({
                  tableName: `${typeName}_${propPrefix}${propName}`,
                  property: dp,
                })),
              ],
            };
            return result;
          }
        }
        if (propSchema.type && typeof propSchema.type === "string") {
          if (isPrimitive(propSchema.type)) {
            if (propSchema.type === "string" && propSchema.enum) {
              return direct(
                `${pp} ${propSchema.enum.map((e: any) => `"${e}"`).join(" | ")}`,
              );
            }
            if (
              propSchema.type === "string" &&
              propSchema.format === "date-time"
            ) {
              return direct(`${pp} DateTime${qm(propName)}`);
            }
            if (propName === "@id" && propSchema.type === "string") {
              return direct(`${replaceAt(propName)} String @id`);
            }
            if (propName.startsWith("@") && propSchema.type === "string") {
              return direct(`${replaceAt(propName)} String${qm(propName)}`);
            }
            return direct(
              `${pp} ${primitiveToPrisma(propSchema.type, qm(propName))}`,
            );
          } else {
            if (propSchema.type === "object" && propSchema.properties) {
              if (propSchema.properties) {
                return propertiesToPrisma(
                  typeName,
                  propSchema.properties,
                  propSchema.required,
                  visited,
                  `${pp}_`,
                  undefined,
                  options,
                );
              }
            }
          }
        }
      }
      return direct("");
    }),
  );
};

type ModelBuildInstruction = Record<string, string[]>;

const buildInstruction2ModelString = (
  buildInstructions: ModelBuildInstruction,
) => {
  return Object.entries(buildInstructions)
    .map(([modelName, properties]) => {
      return `model ${modelName} {
  ${properties.join("\n  ")}
}`;
    })
    .join("\n\n");
};

const addToModel = (
  modelName: string,
  buildInstruction: ModelBuildInstruction,
  propertiesReturn: PropertiesToPrismaReturnType,
) => {
  const model = buildInstruction[modelName] || [];
  const newBuildInstruction = {
    ...buildInstruction,
    [modelName]: [...model, ...propertiesReturn.directProperties],
  };
  return propertiesReturn.externalComplementaryProperties.reduce(
    (cur, { tableName, property }) => ({
      ...cur,
      [tableName]: [...(cur[tableName] || []), property],
    }),
    newBuildInstruction,
  );
};
export const jsonSchema2Prisma = (
  schema: JSONSchema7,
  visited: WeakSet<any>,
  options?: PropertiesToPrismaOptions,
): string => {
  let modelBuildInstruction: ModelBuildInstruction = {};
  if (isJSONSchema(schema)) {
    const definitions = defs(schema) as JSONSchema7["definitions"];
    if (schema.properties && schema.title) {
      const propertiesForModel = propertiesToPrisma(
        schema.title,
        schema.properties,
        schema.required,
        visited,
        undefined,
        undefined,
        options,
      );
      modelBuildInstruction = addToModel(
        schema.title,
        modelBuildInstruction,
        propertiesForModel,
      );
    }
    if (definitions) {
      Object.entries(definitions).forEach(([typeName, typeSchema]) => {
        if (isJSONSchema(typeSchema) && typeSchema.properties) {
          const propertiesForModel = propertiesToPrisma(
            typeName,
            typeSchema.properties,
            typeSchema.required,
            visited,
            undefined,
            undefined,
            options,
          );
          modelBuildInstruction = addToModel(
            typeName,
            modelBuildInstruction,
            propertiesForModel,
          );
        }
      });
    }
  }
  return buildInstruction2ModelString(modelBuildInstruction);
};

export const logPrismaSchemaWithPreamble = (
  schemaName: string,
  schema: JSONSchema7,
): string => {
  const preamble = `
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/@prisma/edb-${schemaName}-client"
}

datasource db {
  provider = env("DATABASE_PROVIDER")
  url      = env("DATABASE_URL")
}
`;

  return `${preamble}${jsonSchema2Prisma(schema, new WeakSet<any>())}`;
};
