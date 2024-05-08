import { Bindings, DatasetCore, Quad, ResultStream } from "@rdfjs/types";
import { NamespaceBuilder } from "@rdfjs/namespace";
import { DeclarativeMapping } from "@slub/edb-ui-utils";
export type * from "./settings";

export type Prefixes = {
  [k: string]: string;
};

export type NamespaceBuilderPrefixes = {
  prefixes: Record<string, NamespaceBuilder>;
};

export type FieldExtractDeclaration<T = any> =
  | string
  | ((entry: T) => string)
  | { path: string };

export type PrimaryField = Partial<{
  label: string;
  description: string;
  image: string;
}>;
export type PrimaryFieldExtract<T> = Partial<{
  label: FieldExtractDeclaration;
  description: FieldExtractDeclaration;
  image: FieldExtractDeclaration;
}>;
export type PrimaryFieldDeclaration<Key extends string = string> = {
  [typeName: Key]: PrimaryField;
};

export type PrimaryFieldExtractDeclaration<
  T = any,
  Key extends string = string,
> = {
  [typeName: Key]: PrimaryFieldExtract<T>;
};

export type PrimaryFieldResults<T> = {
  label: T | null;
  description: T | null;
  image: T | null;
};

export type NamedEntityData = {
  "@id": string;
  [key: string]: any;
};
export type NamedAndTypedEntity = NamedEntityData & {
  "@type": string;
};

export type StringToIRIFn = (property: string) => string;
export type IRIToStringFn = (iri: string) => string;
export interface SparqlBuildOptions {
  base?: string;
  prefixes?: Record<string, string>;
  propertyToIRI: StringToIRIFn;
  typeIRItoTypeName: IRIToStringFn;
  primaryFields: PrimaryFieldDeclaration;
  primaryFieldExtracts: PrimaryFieldExtractDeclaration;
}
export interface SelectFetchOptions {
  withHeaders?: boolean;
}

export type SPARQLCRUDOptions = {
  queryBuildOptions?: SparqlBuildOptions;
  defaultPrefix: string;
  maxRecursion?: number;
};

export type CRUDFunctions = {
  updateFetch: (
    query: string,
  ) => Promise<
    | ResultStream<any>
    | boolean
    | void
    | ResultStream<Bindings>
    | ResultStream<Quad>
    | Response
  >;
  constructFetch: (query: string) => Promise<DatasetCore>;
  selectFetch: (query: string, options?: SelectFetchOptions) => Promise<any>;
  askFetch: (query: string) => Promise<boolean>;
};

export type SparqlEndpoint = {
  label?: string;
  endpoint: string;
  active: boolean;
  auth?: {
    username?: string;
    password?: string;
    token?: string;
  };
  provider?:
    | "allegro"
    | "oxigraph"
    | "worker"
    | "blazegraph"
    | "virtuoso"
    | "qlever"
    | "rest";
};

export type SPARQLFlavour = "default" | "oxigraph" | "blazegraph" | "allegro";

export type QueryOptions = {
  defaultPrefix: string;
  queryBuildOptions: SparqlBuildOptions;
};

export type BasicThingInformation = {
  id: string;
  label: string;
  secondary?: string;
  avatar?: string;
  category?: string;
  allProps?: Record<string, any>;
};

export type QueryBuilderOptions = {
  prefixes: Prefixes;
  defaultPrefix: string;
};

export type Permission = {
  view: boolean;
  edit: boolean;
};

export type PermissionDeclaration<T extends string> = {
  [typeName in T]: Permission;
};

export type NormDataMapping = {
  mapping: DeclarativeMapping;
  typeToTypeMap: Record<string, string | string[]>;
};
