import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { JSONSchema7 } from "json-schema";
import { SPARQLCRUDOptions } from "@slub/edb-core-types";
import { jsonSchema2construct } from "..";
import { CONSTRUCT } from "@tpluscode/sparql-builder";
import df from "@rdfjs/data-model";

export const makeSPARQLConstructQuery = (
  entityIRI: string,
  typeIRI: string | undefined,
  schema: JSONSchema7,
  options: SPARQLCRUDOptions,
) => {
  const { defaultPrefix, queryBuildOptions, maxRecursion } = options;
  const subjectV = df.variable("subject");
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI, subjectV);
  const { construct, whereRequired, whereOptionals } = jsonSchema2construct(
    subjectV,
    schema,
    [],
    ["@id", "@type"],
    maxRecursion,
  );
  if (wherePart + whereRequired + whereOptionals === "") {
    throw new Error("makeSPARQLConstructQuery:empty WHERE clause");
  }
  return withDefaultPrefix(
    defaultPrefix,
    CONSTRUCT` ${construct} `
      .WHERE`${wherePart} ${whereRequired}\n${whereOptionals}`.build(
      queryBuildOptions,
    ),
  );
};
