import { SparqlEndpoint } from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { NamespaceBuilder } from "@rdfjs/namespace";

export type EdbConfRaw = {
  BASE_IRI: string;
  API_URL: string;
  namespaceBase: string;
  walkerOptions: Partial<WalkerOptions>;
  defaultPrefix: string;
  defaultJsonldContext: object;
  defaultQueryBuilderOptions: {
    prefixes: Record<string, string | NamespaceBuilder>;
  };
  sparqlEndpoint: SparqlEndpoint;
};
export type Config = Omit<EdbConfRaw, "namespaceBase"> & {
  namespace: NamespaceBuilder<string>;
};
