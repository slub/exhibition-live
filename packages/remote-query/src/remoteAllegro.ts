import datasetFactory from "@rdfjs/dataset";
import N3 from "n3";
import {
  CRUDFunctions,
  RDFSelectResult,
  SelectFetchOptions,
  SelectFetchOverload,
  SparqlEndpoint,
} from "@slub/edb-core-types";

const fetchNTriples = (query: string, endpoint: string, token?: string) =>
  fetch(endpoint, {
    headers: {
      accept: "application/n-triples,*/*;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      ...(token ? { authorization: `${token}` } : {}),
    },
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-cache",
  });
const fetchSPARQLResults = (query: string, endpoint: string, token?: string) =>
  fetch(endpoint, {
    headers: {
      accept: "application/sparql-results+json,*/*;q=0.9",
      "content-type": "application/x-www-form-urlencoded",
      ...(token ? { authorization: `${token}` } : {}),
    },
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-cache",
  });

const defaultQueryFetch =
  (endpoint: string, accept?: string, contentType?: string, token?: string) =>
  async (query: string) => {
    return await fetchNTriples(query, endpoint, token);
  };

export const allegroCrudOptions: (
  endpoint: SparqlEndpoint,
) => CRUDFunctions = ({ endpoint: url, auth }: SparqlEndpoint) => ({
  askFetch: async (query: string) => {
    const res = await fetchSPARQLResults(query, url, auth?.token);
    const { boolean } = await res.json();
    return boolean === true;
  },
  constructFetch: async (query: string) => {
    const res = await fetchNTriples(query, url, auth?.token),
      reader = new N3.Parser(),
      ntriples = await res.text(),
      ds = datasetFactory.dataset(reader.parse(ntriples));
    return ds;
  },
  updateFetch: defaultQueryFetch(
    url,
    undefined,
    "application/sparql-update",
    auth?.token,
  ),
  selectFetch: (async (query: string, options?: SelectFetchOptions) => {
    const res = await fetchSPARQLResults(query, url, auth?.token);
    const resultJson = (await res.json()) as RDFSelectResult;
    return options?.withHeaders ? resultJson : resultJson?.results?.bindings;
  }) as SelectFetchOverload,
});
