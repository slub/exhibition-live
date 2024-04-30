import { AbstractDatastore } from "@slub/edb-global-types";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import { JSONSchema7 } from "json-schema";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import {
  CRUDFunctions,
  SparqlBuildOptions,
  StringToIRIFn,
} from "@slub/edb-core-types";
import { useMemo } from "react";
import { WalkerOptions } from "@slub/edb-graph-traversal";
import { useAdbContext } from "../provider";

type UserDataStoreProps = {
  crudOptionsPartial?: Partial<CRUDFunctions>;
  schema: JSONSchema7;
  typeNameToTypeIRI: StringToIRIFn;
  queryBuildOptions: SparqlBuildOptions;
  walkerOptions?: Partial<WalkerOptions>;
};

type UseDataStoreState = {
  dataStore: AbstractDatastore;
  ready: boolean;
};

export const useDataStore = ({
  crudOptionsPartial = {},
  schema,
  typeNameToTypeIRI,
  queryBuildOptions,
  walkerOptions,
}: UserDataStoreProps): UseDataStoreState => {
  const { crudOptions: globalCRUDOptions } = useGlobalCRUDOptions();
  const crudOptions = useMemo(
    () => ({ ...globalCRUDOptions, ...crudOptionsPartial }),
    [globalCRUDOptions, crudOptionsPartial],
  );

  const { jsonLDConfig } = useAdbContext();
  const dataStore = useMemo(
    () =>
      crudOptions.constructFetch &&
      initSPARQLStore({
        defaultPrefix: jsonLDConfig.defaultPrefix,
        typeNameToTypeIRI,
        queryBuildOptions,
        walkerOptions,
        sparqlQueryFunctions: crudOptions,
        schema,
        defaultLimit: 10,
      }),
    [crudOptions, jsonLDConfig.defaultPrefix, walkerOptions, schema],
  );

  return {
    dataStore,
    ready: Boolean(dataStore),
  };
};
