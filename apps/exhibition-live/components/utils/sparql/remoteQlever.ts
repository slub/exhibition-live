import dataFactory from "@rdfjs/data-model";
import datasetFactory from "@rdfjs/dataset";
import N3 from "n3";

import { CRUDFunctions } from "../../state/useSPARQL_CRUD";
import { SparqlEndpoint } from "../../state/useLocalSettings";

const cFetch = (query: string, endpoint: string, token?: string) =>
  fetch(endpoint, {
    headers: {
      accept: "application/qlever-results+json",
      "content-type": "application/x-www-form-urlencoded",
      ...(token ? { authorization: `${token}` } : {}),
    },
    body: `query=${encodeURIComponent(query)}`,
    method: "POST",
    mode: "cors",
    credentials: "omit",
    cache: "no-cache",
  });
const askFetch = (query: string, endpoint: string, token?: string) =>
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

const createCutomizedFetch: (
  query: string,
  accept?: string,
  contentType?: string,
  token?: string,
) => (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> =
  (query, accept, contentType = "application/sparql-query", token) =>
  async (input, init) => {
    const headers = new Headers(init?.headers);
    accept && headers.set("accept", accept);
    contentType && headers.set("Content-Type", contentType);
    token && headers.set("authorization", `${token}`);
    const newInit = {
      ...(typeof init === "object" ? init : {}),
      headers,
      body: query,
      method: "POST",
      catch: "no-cache",
    };
    return await fetch(input, newInit);
  };
const defaultQueryFetch =
  (endpoint: string, accept?: string, contentType?: string, token?: string) =>
  async (query: string) => {
    return await cFetch(query, endpoint, token);
  };
export const defaultQuerySelect: (
  query: string,
  endpoint: string,
  token?: string,
) => Promise<any[]> = async (query: string, endpoint, token) => {
  const sFetch = createCutomizedFetch(query);
  const headers = token ? { authorization: `Bearer ${token}` } : {};
  const prepared = await sFetch(endpoint, { headers });
  return ((await prepared.json())?.results?.bindings || []) as any[];
};

export const qleverCrudOptions: (endpoint: SparqlEndpoint) => CRUDFunctions = ({
  endpoint: url,
  auth,
}: SparqlEndpoint) => ({
  askFetch: async (query: string) => {
    const res = await askFetch(query, url, auth?.token);
    const { boolean } = await res.json();
    return boolean === true;
  },
  constructFetch: async (query: string) => {
    const res = await cFetch(query, url, auth?.token);
    const jsonRes = await res.json();
    const reader = new N3.Parser(),
      ntriples =
        jsonRes?.res
          ?.map(
            ([subject, predicate, object]) =>
              `${subject} ${predicate} ${object} .`,
          )
          ?.join("\n") || "",
      ds = datasetFactory.dataset(reader.parse(ntriples));
    return ds;
  },
  updateFetch: async (query: string) => {
    throw new Error("qleverCrudOptions:updateFetch not implemented");
  },
  selectFetch: async (query: string, options) => {
    const res = await askFetch(query, url, auth?.token);
    const resultJson = await res.json();
    return options?.withHeaders ? resultJson : resultJson?.results?.bindings;
  },
});
