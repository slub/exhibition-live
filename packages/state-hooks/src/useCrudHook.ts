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

export type UseCRUDWithQueryClientResult<
  LQ = any,
  EQ = boolean,
  RM = void,
  SM = Record<string, any>,
> = {
  loadEntity: (entityIRI: string, typeIRI: string) => Promise<LQ>;
  loadQuery: ReturnType<typeof useQuery<LQ>>;
  existsQuery: ReturnType<typeof useQuery<EQ>>;
  removeMutation: ReturnType<typeof useMutation<any, unknown, RM>>;
  saveMutation: ReturnType<typeof useMutation<any, unknown, SM>>;
};

export type UseCRUDHook<
  LQ = any,
  EQ = boolean,
  RM = void,
  SM = Record<string, any>,
> = (
  options: UseCRUDWithQueryClientOptions,
) => UseCRUDWithQueryClientResult<LQ, EQ, RM, SM>;
