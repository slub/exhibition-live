import { SparqlEndpoint } from "@slub/edb-core-types";

const p = (key: string, prefix?: string) => (prefix ? `${prefix}_${key}` : key);
export const envToSparqlEndpoint = (
  env: Record<string, string>,
  prefix?: string,
): SparqlEndpoint | undefined => {
  const endpoint = env[p("SPARQL_ENDPOINT", prefix)];
  if (!endpoint) {
    return;
  }
  const label = env[p("SPARQL_ENDPOINT_LABEL", prefix)] || "Custom";
  const provider = env[p("SPARQL_ENDPOINT_PROVIDER", prefix)] || "oxigraph";
  const username = env[p("SPARQL_ENDPOINT_USERNAME", prefix)];
  const password = env[p("SPARQL_ENDPOINT_PASSWORD", prefix)];
  const token = env[p("SPARQL_ENDPOINT_TOKEN", prefix)];
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
