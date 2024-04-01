import { SparqlEndpoint } from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { NamespaceBuilder } from "@rdfjs/namespace";
import { JSONSchema7 } from "json-schema";

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

export type QueryType = {
  search?: string;
};

export type DatastoreBaseConfig = {
  schema: JSONSchema7;
};

export type InitDatastoreFunction<T extends DatastoreBaseConfig> = (
  dataStoreConfig: T,
) => AbstractDatastore;

export type AbstractDatastore = {
  loadDocument: (typeName: string, entityIRI: string) => Promise<any>;
  upsertDocument: (
    typeName: string,
    entityIRI: string,
    document: any,
  ) => Promise<any>;
  listDocuments: (
    typeName: string,
    limit?: number,
    cb?: (document: any) => Promise<any>,
  ) => Promise<any[]>;
  findDocuments: (
    typeName: string,
    query: QueryType,
    limit?: number,
    cb?: (document: any) => Promise<any>,
  ) => Promise<any[]>;
};
