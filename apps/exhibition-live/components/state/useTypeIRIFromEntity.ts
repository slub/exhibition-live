import { useQuery } from "@tanstack/react-query";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { getClasses } from "@slub/sparql-schema";
import { useAdbContext } from "../provider";

export const useTypeIRIFromEntity = (entityIRI: string) => {
  const { queryBuildOptions, jsonLDConfig } = useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const selectFetch = crudOptions?.selectFetch;
  const { data: typeIRIs } = useQuery(
    ["classes", entityIRI],
    async () => {
      return await getClasses(entityIRI, selectFetch, {
        queryBuildOptions,
        defaultPrefix: jsonLDConfig.defaultPrefix,
      });
    },
    {
      enabled: Boolean(entityIRI && selectFetch),
    },
  );
  return typeIRIs;
};
