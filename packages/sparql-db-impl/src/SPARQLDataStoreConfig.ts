import {
  CRUDFunctions,
  SparqlBuildOptions,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { JSONSchema7 } from "json-schema";
import { DatastoreBaseConfig } from "@slub/edb-global-types";

export type SPARQLDataStoreConfig = {
  defaultPrefix: string;
  jsonldContext: object | string;
  typeNameToTypeIRI: StringToIRIFn;
  queryBuildOptions: SparqlBuildOptions;
  walkerOptions?: Partial<WalkerOptions>;
  sparqlQueryFunctions: CRUDFunctions;
  defaultLimit?: number;
  makeStubSchema?: (schema: JSONSchema7) => JSONSchema7;
} & DatastoreBaseConfig;
