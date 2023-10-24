import { QueryEngine } from "@comunica/query-sparql";
import { IDataSource } from "@comunica/types";

export const remoteSparqlQuery = async (
  sparqlQuery: string,
  sources: [IDataSource, ...IDataSource[]],
) => {
  const myEngine = new QueryEngine();
  return await myEngine.queryBindings(sparqlQuery, { sources });
};
