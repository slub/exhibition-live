import {Bindings, DatasetCore, Quad, ResultStream} from "@rdfjs/types";
import {SelectFetchOptions} from "adb-next/components/state/useSPARQL_CRUD";

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

