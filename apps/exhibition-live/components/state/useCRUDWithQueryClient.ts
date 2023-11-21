import { JSONSchema7 } from "json-schema";
import { defaultQueryBuilderOptions } from "../form/formConfigs";
import { CRUDOptions } from "./useSPARQL_CRUD";
import { useGlobalCRUDOptions } from "./useGlobalCRUDOptions";
import {
  QueryObserverOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  cleanJSONLD,
  exists,
  load,
  LoadResult,
  NamedAndTypedEntity,
  remove,
  save,
} from "../utils/crud";
import { useQueryKeyResolver } from "./useQueryKeyResolver";
import { JsonLdContext } from "jsonld-context-parser";

export const useCRUDWithQueryClient = (
  entityIRI: string | undefined,
  typeIRI: string | undefined,
  schema: JSONSchema7,
  defaultPrefix: string,
  crudOptionsPart: Partial<CRUDOptions> = {},
  jsonldContext?: JsonLdContext,
  queryOptions?: QueryObserverOptions<any, Error>,
) => {
  const { crudOptions } = useGlobalCRUDOptions();
  const { constructFetch, updateFetch, askFetch } = crudOptions || {};
  const { resolveSourceIRIs } = useQueryKeyResolver();
  const { enabled, ...queryOptionsRest } = queryOptions || {};
  const queryClient = useQueryClient();

  const loadQuery = useQuery<LoadResult | null>(
    ["load", entityIRI],
    async () => {
      if (!entityIRI || !constructFetch) return null;
      const res = await load(entityIRI, typeIRI, schema, constructFetch, {
        defaultPrefix,
        queryBuildOptions: defaultQueryBuilderOptions,
      });
      return res;
    },
    {
      enabled: Boolean(entityIRI && typeIRI && constructFetch) && enabled,
      refetchOnWindowFocus: false,
      ...queryOptionsRest,
    },
  );

  const removeMutation = useMutation(
    ["remove", entityIRI],
    async () => {
      if (!entityIRI || !updateFetch)
        throw new Error("entityIRI or updateFetch is not defined");
      return remove(entityIRI, typeIRI, schema, updateFetch, {
        defaultPrefix,
        queryBuildOptions: defaultQueryBuilderOptions,
      });
    },
    {
      onSuccess: async () => {
        queryClient.invalidateQueries(["list"]);
      },
    },
  );

  const saveMutation = useMutation(
    ["save", entityIRI],
    async (data: Record<string, any>) => {
      if (!entityIRI || !typeIRI || !updateFetch)
        throw new Error("entityIRI or typeIRI or  updateFetch is not defined");
      const dataWithId: NamedAndTypedEntity = {
        ...data,
        "@id": entityIRI,
        "@type": typeIRI,
      };
      const cleanData = await cleanJSONLD(dataWithId, schema, {
        jsonldContext,
        defaultPrefix,
        keepContext: true,
      });
      await save(cleanData, schema, updateFetch, {
        defaultPrefix,
        queryBuildOptions: defaultQueryBuilderOptions,
      });
      const { "@context": context, ...cleanDataWithoutContext } = cleanData;
      return cleanDataWithoutContext;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["load", entityIRI]);
        /*for (const sourceIRI of resolveSourceIRIs(entityIRI)) {
        console.log('invalidateQueries', sourceIRI)
        await queryClient.invalidateQueries(["load", sourceIRI]);
      }*/
      },
    },
  );

  const existsQuery = useQuery<boolean | null>(
    ["exists", entityIRI],
    async () => {
      if (!entityIRI || !typeIRI || !askFetch) return null;
      return await exists(entityIRI, typeIRI, askFetch);
    },
    {
      enabled: Boolean(entityIRI && typeIRI && askFetch) && enabled,
      refetchOnWindowFocus: false,
      ...queryOptionsRest,
    },
  );

  return {
    loadQuery,
    existsQuery,
    removeMutation,
    saveMutation,
  };
};
