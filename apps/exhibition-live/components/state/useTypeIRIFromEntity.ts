import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../utils/crud";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { defaultPrefix, defaultQueryBuilderOptions } from "../form/formConfigs";

export const useTypeIRIFromEntity = (entityIRI: string) => {
  const { crudOptions } = useGlobalCRUDOptions();
  const selectFetch = crudOptions?.selectFetch;
  const { data: typeIRIs } = useQuery(
    ["classes", entityIRI],
    async () => {
      return await getClasses(entityIRI, selectFetch, {
        queryBuildOptions: defaultQueryBuilderOptions,
        defaultPrefix: defaultPrefix,
      });
    },
    {
      enabled: Boolean(entityIRI && selectFetch),
    },
  );
  return typeIRIs;
};