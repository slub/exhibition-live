import { NamedAndTypedEntity } from "./types";
import { makeSPARQLWherePart } from "./makeSPARQLWherePart";

export const exists = async (
  data: NamedAndTypedEntity,
  askFetch: (query: string) => Promise<any>,
) => {
  const wherePart = makeSPARQLWherePart(data["@id"], data["@type"]);
  return await askFetch(wherePart);
};
