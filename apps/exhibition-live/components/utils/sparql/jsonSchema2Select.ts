import { JsonSchema, resolveSchema } from "@jsonforms/core";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

import { isJSONSchema, isJSONSchemaDefinition } from "../core/jsonSchema";

import { PrimaryFieldDeclaration } from "../types";

const makeWherePart = (queryClause: string, required: boolean) =>
  required ? queryClause : ` OPTIONAL { ${queryClause} } `;
const makePrefixedProperty = (property: string, prefix: string = "") =>
  `${prefix}:${property}`;

const makeVariable = (path: string[]) => `?${path.join("_")}`;
const defaultSeparator = "; ";
const propertiesToSPARQLSelectPatterns = (
  schema: JSONSchema7,
  rootSchema: JSONSchema7,
  currentVariable: string,
  excludedProperties?: string[],
  path?: string[],
  level: number = 0,
  primaryFields?: PrimaryFieldDeclaration,
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
        let innerWherePart = "";
        const ref = (subSchema.items as any)?.$ref as string | undefined;
        if (typeof ref === "string") {
          const typeName = ref.substring(ref.lastIndexOf("/") + 1, ref.length);
          //if typeName within primaryFields expand further
          if (primaryFields && typeName in primaryFields) {
            const fieldDecl = primaryFields[typeName];
            if (fieldDecl.label) {
              const subSubSchema = resolveSchema(
                subSchema.items as JsonSchema,
                "",
                rootSchema as JsonSchema,
              );
              if (
                subSubSchema &&
                isJSONSchemaDefinition(subSubSchema as JSONSchema7Definition) &&
                isJSONSchema(subSubSchema as JSONSchema7)
              ) {
                if (
                  subSubSchema?.properties?.[fieldDecl.label]?.type === "string"
                ) {
                  const lableVariable = makeVariable([...subPath, "label"]);
                  innerWherePart += makeWherePart(
                    ` ${variable} ${makePrefixedProperty(
                      fieldDecl.label,
                    )} ${lableVariable} .
                  `,
                    false,
                  );
                  //make a select that concatenates the entity link with the label to form a list of markdown links link (link1)[label1]; (link2)[label2]; ...)
                  select += ` (GROUP_CONCAT(CONCAT("[", ${lableVariable}, "](", STR(${variable}), ")"); SEPARATOR="${defaultSeparator}") AS ${lableVariable}_group) `;
                  //select += ` (GROUP_CONCAT(${lableVariable}; SEPARATOR="${defaultSeparator}") AS ${lableVariable}_group) `;
                }
              }
            }
          }
        }
        //check if empty by comparing aggregated string length then 0 otherwise count
        select += ` (IF(STRLEN(GROUP_CONCAT(STR(${variable}); SEPARATOR=",")) = 0, 0, COUNT(DISTINCT ${variable})) AS ${variable}_count) `;
        //select += ` (COUNT(DISTINCT ${variable}) AS ${variable}_count) `;
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} .
          ${innerWherePart}
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
            rootSchema,
            variable,
            excludedProperties,
            subPath,
            level + 1,
            primaryFields,
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
  primaryFields?: PrimaryFieldDeclaration;
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
    rootSchema,
    variable,
    excludeProperties,
    [],
    0,
    sparqlSelectOptions?.primaryFields,
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