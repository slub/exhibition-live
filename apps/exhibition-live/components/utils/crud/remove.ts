import { NamedAndTypedEntity, SPARQLCRUDOptions } from "./types";
import { makeSPARQLDeleteQuery } from "./makeSPARQLDeleteQuery";
import { JSONSchema7 } from "json-schema";

export const remove = async (
  data: NamedAndTypedEntity,
  schema: JSONSchema7,
  deleteFetch: (query: string) => Promise<any>,
  options: SPARQLCRUDOptions,
) => {
  const entityIRI = data["@id"];
  const typeIRI = data["@type"];
  const deleteQuery = makeSPARQLDeleteQuery(
    entityIRI,
    typeIRI,
    schema,
    options,
  );
  return await deleteFetch(deleteQuery);
};
