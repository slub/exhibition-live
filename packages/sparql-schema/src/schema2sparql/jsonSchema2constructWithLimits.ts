import { JsonSchema, resolveSchema } from "@jsonforms/core";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { isJSONSchema, isJSONSchemaDefinition } from "@slub/json-schema-utils";
import { Variable } from "@rdfjs/types";

const MAX_RECURSION = 4;
const DEFAULT_LIMIT = 10;

const makePrefixed = (key: string) => (key.includes(":") ? key : `:${key}`);
const mkSubject = (subjectURI: string | Variable) =>
  typeof subjectURI === "string"
    ? subjectURI.startsWith("?")
      ? subjectURI
      : `<${subjectURI}>`
    : `?${subjectURI.value}`;

const propertiesContainStopSymbol = (
  properties: object,
  stopSymbols: string[]
) => {
  return Object.keys(properties).some((key) => stopSymbols.includes(key));
};

const createSubSelect = (
  subject: string,
  predicate: string,
  object: string,
  limit: number
) => `
  {
    SELECT ${subject} ${predicate} (GROUP_CONCAT(${object}; SEPARATOR=",") AS ?${object}_list)
    WHERE {
      ${subject} ${predicate} ${object} .
    }
    GROUP BY ${subject} ${predicate}
    LIMIT ${limit}
  }
`;

const createCountQuery = (
  subject: string,
  predicate: string,
  object: string
) => `
  {
    SELECT ${subject} ${predicate} (COUNT(${object}) AS ?${object}_count)
    WHERE {
      ${subject} ${predicate} ${object} .
    }
    GROUP BY ${subject} ${predicate}
  }
`;

export const jsonSchema2constructWithLimits = (
  subjectURI: string | Variable,
  rootSchema: JSONSchema7,
  stopSymbols: string[] = [],
  excludedProperties: string[] = [],
  maxRecursion: number = MAX_RECURSION,
  defaultLimit: number = DEFAULT_LIMIT
): {
  whereRequired: string;
  whereOptionals: string;
  construct: string;
  countQueries: string;
} => {
  let construct = "",
    whereOptionals = "",
    countQueries = "",
    varIndex = 0;
  const whereRequired = "";
  const s = mkSubject(subjectURI);

  const propertiesToSPARQLPatterns = (
    sP: string,
    subSchema: JSONSchema7,
    level: number
  ) => {
    if (level >= maxRecursion || (level > 0 && propertiesContainStopSymbol(subSchema.properties || {}, stopSymbols))) {
      return;
    }

    const __type = `?__type_${varIndex++}`;
    whereOptionals += `OPTIONAL { ${sP} a ${__type} . }\n`;
    construct += `${sP} a ${__type} .\n`;

    Object.entries(subSchema.properties || {}).forEach(([property, schema]) => {
      if (isJSONSchema(schema) && !excludedProperties.includes(property)) {
        const required = subSchema.required?.includes(property),
          p = makePrefixed(property),
          o = `?${property}_${varIndex++}`;

        if (!required) {
          whereOptionals += `OPTIONAL {\n`;
        }

        if (schema.type === "array") {
          const subSelect = createSubSelect(sP, p, o, defaultLimit);
          whereOptionals += subSelect;
          construct += `${sP} ${p} ${o} .\n`;
          countQueries += createCountQuery(sP, p, o);
        } else {
          whereOptionals += `${sP} ${p} ${o} .\n`;
          construct += `${sP} ${p} ${o} .\n`;
        }

        if (schema.$ref || schema.properties || (schema.items && isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items))) {
          const nextSchema: JSONSchema7 | null = (schema.$ref
            ? resolveSchema(schema as JsonSchema, "", rootSchema as JsonSchema)
            : schema.properties
            ? schema
            : isJSONSchemaDefinition(schema.items) && isJSONSchema(schema.items)
            ? schema.items
            : null) as JSONSchema7 | null;

          if (nextSchema && isJSONSchemaDefinition(nextSchema) && isJSONSchema(nextSchema)) {
            const typedNextSchema = nextSchema as JSONSchema7;
            if (typedNextSchema.properties && !propertiesContainStopSymbol(typedNextSchema.properties, stopSymbols)) {
              propertiesToSPARQLPatterns(o, typedNextSchema, level + 1);
            }
          }
        }

        if (!required) {
          whereOptionals += "}\n";
        }
      }
    });
  };

  propertiesToSPARQLPatterns(s, rootSchema, 0);

  if (isJSONSchemaDefinition(rootSchema.items) && isJSONSchema(rootSchema.items) && rootSchema.items.properties) {
    propertiesToSPARQLPatterns(s, rootSchema.items, 0);
  }

  return { construct, whereRequired, whereOptionals, countQueries };
};
