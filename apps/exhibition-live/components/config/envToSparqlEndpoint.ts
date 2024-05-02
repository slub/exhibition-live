import { SparqlEndpoint } from "@slub/edb-core-types";

export const envToSparqlEndpoint = (
  env: Record<string, string>,
): SparqlEndpoint | undefined => {
  const endpoint = env.SPARQL_ENDPOINT;
  if (!endpoint) {
    return;
  }
  const label = env.SPARQL_ENDPOINT_LABEL || "Custom";
  const provider = env.SPARQL_ENDPOINT_PROVIDER || "oxigraph";
  const username = env.SPARQL_ENDPOINT_USERNAME;
  const password = env.SPARQL_ENDPOINT_PASSWORD;
  const token = env.SPARQL_ENDPOINT_TOKEN;
  return {
    label,
    endpoint,
    active: true,
    provider,
    auth: {
      username,
      password,
      token,
    },
  } as SparqlEndpoint;
};
