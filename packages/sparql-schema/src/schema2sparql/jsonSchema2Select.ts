import { JsonSchema, resolveSchema } from "@jsonforms/core";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

import {
  isJSONSchema,
  isJSONSchemaDefinition,
  isPrimitive,
} from "@slub/json-schema-utils";

import { PrimaryFieldDeclaration, SPARQLFlavour } from "@slub/edb-core-types";

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
  flavour?: SPARQLFlavour,
  minimal?: boolean,
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
      if (subSchema.type === "array" && !minimal) {
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
                  select += ` (GROUP_CONCAT(DISTINCT CONCAT("[", ${lableVariable}, "](", STR(${variable}), ")"); SEPARATOR="${defaultSeparator}") AS ${lableVariable}_group) `;
                  //select += ` (GROUP_CONCAT(${lableVariable}; SEPARATOR="${defaultSeparator}") AS ${lableVariable}_group) `;
                }
              }
            }
          }
        }
        if (flavour === "oxigraph") {
          //check if empty by comparing aggregated string length then 0 otherwise count
          select += ` (IF(STRLEN(GROUP_CONCAT(DISTINCT STR(${variable}); SEPARATOR=",")) = 0, 0, COUNT(DISTINCT ${variable})) AS ${variable}_count) `;
        } else {
          select += ` (COUNT(DISTINCT ${variable}) AS ${variable}_count) `;
        }
        //select += ` (COUNT(DISTINCT ${variable}) AS ${variable}_count) `;
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} .
          ${innerWherePart}
          `,
          isRequired,
        );
      } else if (
        typeof subSchema.type === "string" &&
        isPrimitive(subSchema.type)
      ) {
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
            flavour,
            minimal,
          );
        where += makeWherePart(
          ` ${currentVariable} ${prefixedProperty} ${variable} . \n ${subWhere} `,
          isRequired,
        );
        select += subSelect;
      } else if (subSchema.$ref && !minimal) {
        const subSubSchema = resolveSchema(
          subSchema as JsonSchema,
          "",
          rootSchema as JsonSchema,
        );
        if (subSubSchema && subSubSchema.properties) {
          const { where: subWhere, select: subSelect } =
            propertiesToSPARQLSelectPatterns(
              subSubSchema as JSONSchema7,
              rootSchema,
              variable,
              excludedProperties,
              subPath,
              level + 1,
              primaryFields,
              flavour,
              true,
            );
          const typeVariable = makeVariable([...subPath, "type"]);
          const typeName = subSchema.$ref.substring(
            subSchema.$ref.lastIndexOf("/") + 1,
            subSchema.$ref.length,
          );
          let primaryInfoWhere = "";
          if (primaryFields && typeName in primaryFields) {
            const primaryFieldDeclaration =
              primaryFields && primaryFields[typeName];
            Object.entries(primaryFieldDeclaration).forEach(([key, value]) => {
              const primaryMultiVariable = makeVariable([
                ...subPath,
                `${key}_all`,
              ]);
              const primarySingleVariable = makeVariable([...subPath, key]);
              primaryInfoWhere += `OPTIONAL { ${variable} ${makePrefixedProperty(value)} ${primaryMultiVariable} . } `;
              select += ` (SAMPLE(${primaryMultiVariable}) AS ${primarySingleVariable}) `;
            });
          }
          where += makeWherePart(
            ` ${currentVariable} ${prefixedProperty} ${variable} . \n ${variable} a ${typeVariable} . \n ${subWhere} \n ${primaryInfoWhere} `,
            isRequired,
          );
          select += ` (SAMPLE(${variable}) AS ${variable}_IRI) (SAMPLE(${typeVariable}) AS ${typeVariable}) `;
          select += subSelect;
        }
      }
    },
  );

  return {
    where,
    select,
  };
};

type MultiSortOrder = {
  descending: boolean;
  orderBy: string;
}[];

type SPARQLSelectOptions = {
  orderBy?: string | MultiSortOrder;
  descending?: boolean;
  limit?: number;
  offset?: number;
  primaryFields?: PrimaryFieldDeclaration;
};

const sparqlPartFromOptions = (options: SPARQLSelectOptions) => {
  let sparqlParts = [];
  //always order by entity
  sparqlParts.push(` ORDER BY `);
  if (typeof options.orderBy === "string") {
    sparqlParts.push(
      ` ${options?.descending ? "DESC" : "ASC"}(${options.orderBy})`,
    );
  } else if (Array.isArray(options.orderBy) && options.orderBy.length > 0) {
    sparqlParts.push(
      ` ${options.orderBy
        .map(
          ({ orderBy, descending }) =>
            `${descending ? "DESC" : "ASC"}(?${orderBy})`,
        )
        .join(" ")}`,
    );
  }
  sparqlParts.push(` ASC(?entity) `);
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
  countResults?: boolean,
  flavour?: SPARQLFlavour,
  minimal?: boolean,
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
    flavour,
    minimal,
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
