import { JSONSchema7 } from "json-schema";
import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { DELETE } from "@tpluscode/sparql-builder";
import {SPARQLCRUDOptions} from "@slub/edb-core-types";

/**
 * Will move the entity to trash by renaming the classIRI to classIRI_trash
 * and removing all triples with the entityIRI rdf:rype ?class
 * and adding all triples with the entityIRI rdf:rype ?class_trash
 *
 * @param entityIRI
 * @param typeIRI
 * @param schema
 * @param options
 */
export const makeSPARQLToTrashQuery = (
  entityIRI: string | string[],
  typeIRI: string,
  schema: JSONSchema7,
  options: SPARQLCRUDOptions,
) => {
  const s = "?subject";
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI, s);
  return withDefaultPrefix(
    options.defaultPrefix,
    DELETE` ${s} a ?class `.INSERT` ${s} a ?class_trash `.WHERE`
      ${wherePart}
      ${s} a ?class .
      BIND (IRI(CONCAT(STR(?class), "_trash")) AS ?class_trash)`.build(
      options.queryBuildOptions,
    ),
  );
};
