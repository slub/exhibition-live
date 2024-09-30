import {
  IRIToStringFn,
  NormDataMapping,
  SparqlBuildOptions,
  SparqlEndpoint,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { NamespaceBuilder } from "@rdfjs/namespace";
import { JSONSchema7 } from "json-schema";
import { UrlObject } from "url";
import { ParsedUrlQuery } from "querystring";
import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonFormsUISchemaRegistryEntry,
} from "@jsonforms/core";
import { JSONLDConfig } from "@slub/edb-state-hooks/src";
import { ErrorObject } from "ajv";
import { JsonFormsInitStateProps } from "@jsonforms/react";
import React from "react";
import {
  DeclarativeMapping,
  DeclarativeMappings,
  DeclarativeMatchBasedFlatMappings,
} from "@slub/edb-data-mapping";

export type EdbConfRaw = {
  BASE_IRI: string;
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

export type SimplifiedEndpointConfig = {
  baseIRI: string;
  entityBaseIRI: string;
  endpoint: SparqlEndpoint;
  jsonldContext?: object;
};

export type QueryType = {
  sorting?: {
    id: string;
    desc?: boolean;
  }[];
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
  findDocumentsByLabel?: (
    typeName: string,
    label: string,
    limit?: number,
  ) => Promise<FindResult>;
  findDocumentsByAuthorityIRI?: (
    typeName: string,
    authorityIRI: string,
    repositoryIRI?: string,
    limit?: number,
  ) => Promise<FindResult>;
  findDocumentsAsFlatResultSet?: (
    typeName: string,
    query: QueryType,
    limit?: number,
  ) => Promise<any>;
  getClasses?: (entityIRI: string) => Promise<string[]>;
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
  searchParams: URLSearchParams;
  setSearchParams?: (searchParams: URLSearchParams) => void;
};

export type SemanticJsonFormProps = {
  entityIRI?: string | undefined;
  data: any;
  onChange: (data: any) => void;
  shouldLoadInitially?: boolean;
  typeIRI: string;
  schema: JSONSchema7;
  jsonldContext: JsonLdContext;
  debugEnabled?: boolean;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  defaultPrefix: string;
  hideToolbar?: boolean;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  toolbarChildren?: React.ReactNode;
  disableSimilarityFinder?: boolean;
  enableSidebar?: boolean;
  wrapWithinCard?: boolean;
};

export type SemanticJsonFormNoOpsProps = {
  typeIRI: string;
  data: any;
  onChange?: (data: any, reason: ChangeCause) => void;
  onError?: (errors: ErrorObject[]) => void;
  schema: JSONSchema7;
  jsonFormsProps?: Partial<JsonFormsInitStateProps>;
  onEntityChange?: (entityIRI: string | undefined) => void;
  onEntityDataChange?: (entityData: any) => void;
  toolbar?: React.ReactNode;
  forceEditMode?: boolean;
  defaultEditMode?: boolean;
  searchText?: string;
  disableSimilarityFinder?: boolean;
  enableSidebar?: boolean;
  wrapWithinCard?: boolean;
  formsPath?: string;
};

export type KnowledgeSources = "kb" | "gnd" | "wikidata" | "k10plus" | "ai";

export type SimilarityFinderProps = {
  finderId: string;
  data: any;
  classIRI: string;
  jsonSchema: JSONSchema7;
  onEntityIRIChange?: (entityIRI: string | undefined) => void;
  onMappedDataAccepted?: (data: any) => void;
  onExistingEntityAccepted?: (entityIRI: string, data: any) => void;
  onSelectedEntityChange?: (id: string, authorityIRI: string) => void;
  searchOnDataPath?: string;
  search?: string;
  hideFooter?: boolean;
  knowledgeSources?: KnowledgeSources[];
  additionalKnowledgeSources?: KnowledgeSources[];
};

export type GlobalAppConfig = {
  queryBuildOptions: SparqlBuildOptions;
  typeNameToTypeIRI: StringToIRIFn;
  typeIRIToTypeName: IRIToStringFn;
  createEntityIRI: (typeName: string, id?: string) => string;
  propertyNameToIRI: StringToIRIFn;
  propertyIRIToPropertyName: IRIToStringFn;
  jsonLDConfig: JSONLDConfig;
  normDataMapping: {
    [authorityIRI: string]: NormDataMapping;
  };
  schema: JSONSchema7;
  makeStubSchema?: (schema: JSONSchema7) => JSONSchema7;
  uiSchemaDefaultRegistry?: JsonFormsUISchemaRegistryEntry[];
  rendererRegistry?: JsonFormsRendererRegistryEntry[];
  primaryFieldRendererRegistry?: (
    typeIRI: string,
  ) => JsonFormsRendererRegistryEntry[];
  cellRendererRegistry?: JsonFormsCellRendererRegistryEntry[];
  uischemata?: Record<string, any>;
};

export type AvailableFlatMappings = Record<
  string,
  { mapping: DeclarativeMatchBasedFlatMappings; typeName: string }
>;

export type AvailableMappings = Record<
  string,
  { mapping: DeclarativeMapping; typeName: string }
>;
