import {
  IRIToStringFn,
  SparqlEndpoint,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { NamespaceBuilder } from "@rdfjs/namespace";
import { JSONSchema7 } from "json-schema";
import { UrlObject } from "url";
import { ParsedUrlQuery } from "querystring";

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

export type CountAndIterable<DocumentResult> = {
  amount: number;
  iterable: AsyncIterable<DocumentResult>;
};

export type AbstractDatastoreIterable<DocumentResult> = {
  listDocuments: (
    typeName: string,
    limit?: number,
  ) => Promise<CountAndIterable<DocumentResult>>;
  findDocuments: (
    typeName: string,
    query: QueryType,
    limit?: number,
  ) => Promise<CountAndIterable<DocumentResult>>;
};

export type AbstractDatastore<
  UpsertResult = any,
  LoadResult = any,
  FindResult = any[],
  RemoveResult = any,
  DocumentResult = LoadResult,
  ImportResult = any,
  BulkImportResult = any,
> = {
  typeNameToTypeIRI: StringToIRIFn;
  typeIRItoTypeName: IRIToStringFn;
  removeDocument: (
    typeName: string,
    entityIRI: string,
  ) => Promise<RemoveResult>;
  importDocument: (
    typeName: string,
    entityIRI: any,
    importStore: AbstractDatastore,
  ) => Promise<ImportResult>;
  importDocuments: (
    typeName: string,
    importStore: AbstractDatastore,
    limit: number,
  ) => Promise<BulkImportResult>;
  loadDocument: (typeName: string, entityIRI: string) => Promise<LoadResult>;
  existsDocument: (typeName: string, entityIRI: string) => Promise<boolean>;
  upsertDocument: (
    typeName: string,
    entityIRI: string,
    document: any,
  ) => Promise<UpsertResult>;
  listDocuments: (
    typeName: string,
    limit?: number,
    cb?: (document: any) => Promise<any>,
  ) => Promise<FindResult>;
  findDocuments: (
    typeName: string,
    query: QueryType,
    limit?: number,
    cb?: (document: any) => Promise<DocumentResult>,
  ) => Promise<FindResult>;
  findDocumentsAsFlatResultSet?: (
    typeName: string,
    query: QueryType,
    limit?: number,
  ) => Promise<any>;
  iterableImplementation?: AbstractDatastoreIterable<DocumentResult>;
};

export type EditEntityModalProps = {
  typeIRI: string | undefined;
  entityIRI: string;
  data: any;
  disableLoad?: boolean;
};

export type EntityDetailModalProps = EditEntityModalProps & {
  readonly?: boolean;
  disableInlineEditing?: boolean;
};
export type Url = UrlObject | string;

export type ModRouter = {
  query: ParsedUrlQuery;
  asPath: string;
  replace: (url: Url, as?: Url) => Promise<void | boolean>;
  push: (url: Url, as?: Url) => Promise<void | boolean>;
  pathname: string;
};
