import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { JSONSchema7 } from "json-schema";
import { SPARQLCRUDOptions } from "./types";
import { jsonSchema2construct } from "../sparql";
import { CONSTRUCT } from "@tpluscode/sparql-builder";

export const makeSPARQLConstructQuery = (
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
    CONSTRUCT` ${construct} `
      .WHERE`${wherePart} ${whereRequired}\n${whereOptionals}`.build(
      queryBuildOptions,
    ),
  );
};
