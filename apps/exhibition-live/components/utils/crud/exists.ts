import { NamedAndTypedEntity } from "./types";
import { makeSPARQLWherePart } from "./makeSPARQLWherePart";
import { ASK } from "@tpluscode/sparql-builder";

export const exists = async (
  entityIRI: string,
  typeIRI: string,
  askFetch: (query: string) => Promise<boolean>,
) => {
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI);
  const askQuery = ASK`${wherePart}`.build();
  return await askFetch(askQuery);
};
