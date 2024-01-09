import { JSONSchema7 } from "json-schema";
import { SPARQLCRUDOptions } from "./types";
import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { DELETE } from "@tpluscode/sparql-builder";

export const makeSPARQLRestoreFromTrashQuery = (
  entityIRI: string | string[],
  typeIRI: string,
  schema: JSONSchema7,
  options: SPARQLCRUDOptions,
) => {
  const s = "?subject";
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI, s);
  return withDefaultPrefix(
    options.defaultPrefix,
    DELETE` ${s} a ?class_trash `.INSERT` ${s} a ?class `.WHERE`
      ${wherePart}
      ${s} a ?class_trash .
      BIND (IRI(REPLACE(STR(?class_trash), "_trash", "")) AS ?class)`.build(
      options.queryBuildOptions,
    ),
  );
};
