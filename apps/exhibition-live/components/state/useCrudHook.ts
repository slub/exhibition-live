import { JSONSchema7 } from "json-schema";
import {
  QueryObserverOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { CRUDFunctions, SparqlBuildOptions } from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";

export type CRUDOptions = CRUDFunctions & {
  defaultPrefix: string;
  data: any;
  setData?: (data: any, isRefetch: boolean) => void;
  walkerOptions?: Partial<WalkerOptions>;
  queryBuildOptions?: SparqlBuildOptions;
  upsertByDefault?: boolean;
  ready?: boolean;
  onLoad?: (data: any) => void;
  queryOptions?: QueryObserverOptions<any, Error>;
  queryKey?: string;
};

export type UseCRUDWithQueryClientOptions = {
  entityIRI?: string | undefined;
  typeIRI?: string | undefined;
  schema: JSONSchema7;
  queryOptions?: QueryObserverOptions<any, Error>;
  loadQueryKey?: string;
  crudOptionsPartial?: Partial<CRUDOptions>;
  allowUnsafeSourceIRIs?: boolean;
};

export type UseCRUDWithQueryClientResult = {
  loadQuery: ReturnType<typeof useQuery<any>>;
  existsQuery: ReturnType<typeof useQuery<any>>;
  removeMutation: ReturnType<typeof useMutation<any>>;
  saveMutation: ReturnType<typeof useMutation<any>>;
};

export type UseCRUDHook = (
  options: UseCRUDWithQueryClientOptions,
) => UseCRUDWithQueryClientResult;
