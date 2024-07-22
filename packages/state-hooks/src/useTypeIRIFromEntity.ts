import { useQuery } from "@tanstack/react-query";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import { useAdbContext } from "./provider";
import { useDataStore } from "./useDataStore";

export const useTypeIRIFromEntity = (entityIRI: string) => {
  const { schema, typeNameToTypeIRI, queryBuildOptions, jsonLDConfig } =
    useAdbContext();
  const { crudOptions } = useGlobalCRUDOptions();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial: crudOptions,
    typeNameToTypeIRI,
    queryBuildOptions,
  });
  const { data: typeIRIs } = useQuery(
    ["classes", entityIRI],
    async () => {
      return await dataStore.getClasses(entityIRI);
    },
    {
      enabled: Boolean(entityIRI && ready),
    },
  );
  return typeIRIs;
};
