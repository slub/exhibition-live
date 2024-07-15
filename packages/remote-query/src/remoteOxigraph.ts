import { QueryEngine } from "@comunica/query-sparql";
import { IDataSource } from "@comunica/types";
import datasetFactory from "@rdfjs/dataset";
import N3 from "n3";
import {
  CRUDFunctions,
  RDFSelectResult,
  SelectFetchOptions,
  SelectFetchOverload,
  SparqlEndpoint,
} from "@slub/edb-core-types";

const fetchNTriples = (query: string, endpoint: string) =>
  fetch(endpoint, {
    headers: {
      accept: "application/n-triples,*/*;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-cache",
  });
const fetchSPARQLResults = (query: string, endpoint: string) =>
  fetch(endpoint, {
    headers: {
      accept: "application/sparql-results+json,*/*;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-cache",
  });

const defaultQueryFetch =
  (endpoint: string, accept?: string, contentType?: string) =>
  async (query: string) => {
    const engine = new QueryEngine();
    const prepared = await engine.query(query, {
      sources: [endpoint] as [IDataSource],
    });
    return await prepared.execute();
  };
export const oxigraphCrudOptions: (
  endpoint: SparqlEndpoint,
) => CRUDFunctions = ({ endpoint: url }: SparqlEndpoint) => ({
  askFetch: async (query: string) => {
    const res = await fetchSPARQLResults(query, url);
    const { boolean } = await res.json();
    return boolean === true;
  },
  constructFetch: async (query: string) => {
    const res = await fetchNTriples(query, url),
      reader = new N3.Parser(),
      ntriples = await res.text(),
      ds = datasetFactory.dataset(reader.parse(ntriples));
    return ds;
  },
  updateFetch: defaultQueryFetch(
    url.replace("query", "update"),
    undefined,
    "application/sparql-update",
  ),
  selectFetch: (async (query: string, options?: SelectFetchOptions) => {
    const res = await fetchSPARQLResults(query, url);
    const resultJson = (await res.json()) as RDFSelectResult;
    return options?.withHeaders ? resultJson : resultJson?.results?.bindings;
  }) as SelectFetchOverload,
});
