import { AbstractDatastore } from "@slub/edb-global-types";
import { initSPARQLStore } from "@slub/sparql-db-impl";
import { JSONSchema7 } from "json-schema";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { useGlobalSettings } from "./useGlobalSettings";
import { CRUDFunctions } from "@slub/edb-core-types";
import { sladb } from "../form/formConfigs";
import { useMemo } from "react";
import { WalkerOptions } from "@slub/edb-graph-traversal";

type UserDataStoreProps = {
  crudOptionsPartial?: Partial<CRUDFunctions>;
  schema: JSONSchema7;
  walkerOptions?: Partial<WalkerOptions>;
};

type UseDataStoreState = {
  dataStore: AbstractDatastore;
  ready: boolean;
};

export const typeNameToTypeIRI = (typeName: string) => sladb(typeName).value;
export const useDataStore = ({
  crudOptionsPartial = {},
  schema,
  walkerOptions,
}: UserDataStoreProps): UseDataStoreState => {
  const { crudOptions: globalCRUDOptions } = useGlobalCRUDOptions();
  const crudOptions = useMemo(
    () => ({ ...globalCRUDOptions, ...crudOptionsPartial }),
    [globalCRUDOptions, crudOptionsPartial],
  );

  const { defaultPrefix, namespacePrefixes } = useGlobalSettings();
  const dataStore = useMemo(
    () =>
      crudOptions.constructFetch &&
      initSPARQLStore({
        defaultPrefix,
        typeNameToTypeIRI,
        queryBuildOptions: namespacePrefixes,
        walkerOptions,
        sparqlQueryFunctions: crudOptions,
        schema,
        defaultLimit: 10,
      }),
    [crudOptions, defaultPrefix, namespacePrefixes, walkerOptions, schema],
  );

  return {
    dataStore,
    ready: Boolean(dataStore),
  };
};
