import { JSONSchema7 } from "json-schema";
import { makeSPARQLToTrashQuery } from "./makeSPARQLToTrashQuery";
import { SPARQLCRUDOptions } from "@slub/edb-core-types";

export const moveToTrash = async (
  entityIRI: string | string[],
  typeIRI: string | undefined,
  schema: JSONSchema7,
  updateFetch: (query: string) => Promise<any>,
  options: SPARQLCRUDOptions,
) => {
  //will rename every classIRI to classIRI_trash
  const renameClassQuery = makeSPARQLToTrashQuery(
    entityIRI,
    typeIRI,
    schema,
    options,
  );

  return await updateFetch(renameClassQuery);
};
