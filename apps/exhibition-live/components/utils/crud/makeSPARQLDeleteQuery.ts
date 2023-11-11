import { jsonSchema2construct } from "../sparql";
import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { DELETE } from "@tpluscode/sparql-builder";
import { JSONSchema7 } from "json-schema";
import { SPARQLCRUDOptions } from "./types";

export const makeSPARQLDeleteQuery = (
  entityIRI: string,
  typeIRI: string,
  schema: JSONSchema7,
  options: SPARQLCRUDOptions,
) => {
  const { defaultPrefix, queryBuildOptions } = options;
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI);
  const { construct, whereRequired, whereOptionals } = jsonSchema2construct(
    entityIRI,
    schema,
    ["@id"],
    ["@id", "@type"],
  );
  return withDefaultPrefix(
    defaultPrefix,
    DELETE` ${construct} `
      .WHERE`${wherePart} ${whereRequired}\n${whereOptionals}`.build(
      queryBuildOptions,
    ),
  );
};
