import { JSONSchema7 } from "json-schema";
import { SPARQLCRUDOptions } from "@slub/edb-core-types";
import { makeSPARQLRestoreFromTrashQuery } from "./makeSPARQLRestoreFromTrashQuery";

export const restoreFromTrash = async (
  entityIRI: string | string[],
  typeIRI: string | undefined,
  schema: JSONSchema7,
  updateFetch: (query: string) => Promise<any>,
  options: SPARQLCRUDOptions,
) => {
  const renameClassQuery = makeSPARQLRestoreFromTrashQuery(
    entityIRI,
    typeIRI,
    schema,
    options,
  );

  return await updateFetch(renameClassQuery);
};
