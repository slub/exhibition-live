import { CRUDOptions } from "./useSPARQL_CRUD";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { JSONSchema7 } from "json-schema";
import { load } from "@slub/sparql-schema";
import { defaultQueryBuilderOptions } from "../form/formConfigs";

export const useLoadQuery = (
  defaultPrefix: string,
  queryKey: string = "load",
  crudOptionsPart: Partial<CRUDOptions> = {},
) => {
  const { crudOptions: globalCRUDOptions } = useGlobalCRUDOptions();
  const crudOptions = { ...globalCRUDOptions, ...crudOptionsPart };
  const { constructFetch } = crudOptions || {};
  const queryClient = useQueryClient();

  const loadEntity = useCallback(
    async (entityIRI: string, typeIRI: string, schema: JSONSchema7) => {
      return queryClient.fetchQuery(
        [queryKey, typeIRI, entityIRI],
        async () => {
          if (!entityIRI || !constructFetch) return null;
          const res = await load(entityIRI, typeIRI, schema, constructFetch, {
            defaultPrefix,
            queryBuildOptions: defaultQueryBuilderOptions,
          });
          return res;
        },
      );
    },
    [constructFetch, defaultPrefix, queryKey, queryClient],
  );

  return loadEntity;
};
