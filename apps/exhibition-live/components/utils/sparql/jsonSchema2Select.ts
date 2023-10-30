import { JsonSchema, resolveSchema } from "@jsonforms/core";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

import { isJSONSchema, isJSONSchemaDefinition } from "../core/jsonSchema";

const makeWherePart = (queryClause: string, required: boolean) =>
  required ? queryClause : ` OPTIONAL { ${queryClause} } `;
const makePrefixedProperty = (property: string, prefix: string = "") =>
  `${prefix}:${property}`;

const makeVariable = (path: string[]) => `?${path.join("_")}`;
const propertiesToSPARQLSelectPatterns = (
  schema: JSONSchema7,
  currentVariable: string,
  excludedProperties?: string[],
  path?: string[],
  level: number = 0,
) => {
  let where = "";
  let select = "";

  const properties = schema.properties;
  if (!properties) return { where, select };

  Object.entries(properties).forEach(
    ([property, subSchema]: [string, JSONSchema7]) => {
      if (excludedProperties?.includes(property) || property.startsWith("@"))
        return;
      const subPath = [...path, property],
        isRequired = Boolean(schema.required?.includes(property)),
        prefixedProperty = makePrefixedProperty(property),
        variable = makeVariable(subPath);
      if (subSchema.type === "array") {
        //count
        select += ` (COUNT(DISTINCT ${variable}) AS ${variable}_count) `;
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} .
          `,
          isRequired,
        );
      } else if (subSchema.type !== "object") {
        //primitive (make sure we get only one value)
        select += ` (SAMPLE(${variable}) AS ${variable}_single) `;
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} . `,
          isRequired,
        );
      } else if (subSchema.type === "object" && !subSchema.$ref) {
        //sub-object
        const { where: subWhere, select: subSelect } =
          propertiesToSPARQLSelectPatterns(
            subSchema,
            variable,
            excludedProperties,
            subPath,
            level + 1,
          );
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} . \n ${subWhere} `,
          isRequired,
        );
        select += subSelect;
      }
    },
  );

  return {
    where,
    select,
  };
};

type SPARQLSelectOptions = {
  orderBy?: string;
  descending?: boolean;
  limit?: number;
  offset?: number;
};

const sparqlPartFromOptions = (options: SPARQLSelectOptions) => {
  let sparqlParts = [];
  if (options.orderBy) {
    sparqlParts.push(
      `ORDER BY ${options?.descending ? "DESC" : "ASC"}(${options.orderBy})`,
    );
  }
  if (options.limit) {
    sparqlParts.push(`LIMIT ${options.limit}`);
  }
  if (options.offset) {
    sparqlParts.push(`OFFSET ${options.offset}`);
  }
  return sparqlParts.join("\n");
};

/**
 * creates the WHERE clause of a SPARQL SELECT query from a JSON Schema
 *
 * it will create a query that will return all the properties of instances of the given type
 *
 * primitive properties will be returned as is
 * for sub-object properties will be build recursively
 * lists will be counted:
 *
 * @param rootSchema
 * @param typeIRI
 * @param excludeProperties
 * @param sparqlSelectOptions
 */
export const jsonSchema2Select = (
  rootSchema: JSONSchema7,
  typeIRI?: string,
  excludeProperties?: string[],
  sparqlSelectOptions?: SPARQLSelectOptions,
) => {
  if (!rootSchema.properties) return "";
  const variable = "?entity";
  const { where, select } = propertiesToSPARQLSelectPatterns(
    rootSchema,
    variable,
    excludeProperties,
    [],
    0,
  );
  const matchType = typeIRI ? `?entity a <${typeIRI}> .` : "";
  const sparqlFinish = sparqlSelectOptions
    ? sparqlPartFromOptions(sparqlSelectOptions)
    : "";
  const query = `SELECT DISTINCT ${variable} ${select} WHERE {
    ${matchType}
    ${where}
}
GROUP BY ${variable}
${sparqlFinish}`;

  return query;
};
