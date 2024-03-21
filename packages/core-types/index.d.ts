import {Bindings, DatasetCore, Quad, ResultStream} from "@rdfjs/types";
import {NamespaceBuilder} from "@rdfjs/namespace";

export type Prefixes = {
  [k: string]: string;
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
export type PrimaryFieldDeclaration = {
  [typeName: string]: PrimaryField;
};

export type PrimaryFieldExtractDeclaration<T = any> = {
  [typeName: string]: PrimaryFieldExtract<T>;
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
export interface SparqlBuildOptions {
  base?: string;
  prefixes?: Record<string, string | NamespaceBuilder>;
}

export interface SelectFetchOptions {
  withHeaders?: boolean;
}

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

export type SPARQLCRUDOptions = {
  queryBuildOptions?: SparqlBuildOptions;
  defaultPrefix: string;
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
    | "qlever";
};

export type SPARQLFlavour = "default" | "oxigraph" | "blazegraph" | "allegro";

export type QueryOptions =  { defaultPrefix: string, queryBuildOptions: SparqlBuildOptions}

