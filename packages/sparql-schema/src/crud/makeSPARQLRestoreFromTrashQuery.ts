import { JSONSchema7 } from "json-schema";
import { makeSPARQLWherePart, withDefaultPrefix } from "./makeSPARQLWherePart";
import { DELETE } from "@tpluscode/sparql-builder";
import { SPARQLCRUDOptions } from "@slub/edb-core-types";

export const makeSPARQLRestoreFromTrashQuery = (
  entityIRI: string | string[],
  typeIRI: string,
  schema: JSONSchema7,
  options: SPARQLCRUDOptions,
) => {
  const s = "?subject";
  const typeIRIWithTrash = typeIRI + "_trash";
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRIWithTrash, s);
  return withDefaultPrefix(
    options.defaultPrefix,
    DELETE` ${s} a ?class_trash `.INSERT` ${s} a <${typeIRI}> `.WHERE`
      ${wherePart}
      `.build(options.queryBuildOptions),
  );
};
