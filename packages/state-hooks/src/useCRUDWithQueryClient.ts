import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cleanJSONLD, jsonld2DataSet, LoadResult } from "@slub/sparql-schema";
import { useDataStore } from "./useDataStore";
import { filterUndefOrNull } from "@slub/edb-core-utils";
import { useAdbContext } from "./provider";
import { UseCRUDHook } from "./useCrudHook";
import { useCallback } from "react";
import { NamedAndTypedEntity } from "@slub/edb-core-types";

const getAllSubjectsFromResult = (result: any) => {
  const ds = jsonld2DataSet(result);
  const subjects: Set<string> = new Set();
  // @ts-ignore
  for (const quad of ds) {
    if (quad.subject.termType === "NamedNode") {
      subjects.add(quad.subject.value);
    }
  }
  return Array.from(subjects);
};

const resultWithSubjects = (result: any) => {
  let subjects = [];
  try {
    subjects = getAllSubjectsFromResult(result);
  } catch (e) {}
  return {
    subjects,
    document: result,
  };
};
export const useCRUDWithQueryClient: UseCRUDHook<
  LoadResult,
  boolean,
  void,
  Record<string, any>
> = ({
  entityIRI,
  typeIRI,
  schema,
  queryOptions,
  loadQueryKey,
  crudOptionsPartial,
  allowUnsafeSourceIRIs,
}) => {
  const { queryBuildOptions, typeNameToTypeIRI, jsonLDConfig } =
    useAdbContext();
  const { dataStore, ready } = useDataStore({
    schema,
    crudOptionsPartial,
    typeNameToTypeIRI,
    queryBuildOptions,
  });

  const { defaultPrefix, jsonldContext } = jsonLDConfig;
  //const { resolveSourceIRIs } = useQueryKeyResolver();
  const { enabled, ...queryOptionsRest } = queryOptions || {};
  const queryClient = useQueryClient();

  const loadQuery = useQuery<LoadResult | null>(
    [loadQueryKey, entityIRI],
    async () => {
      if (!entityIRI || !ready) return null;
      const typeName = dataStore.typeIRItoTypeName(typeIRI);
      const result = await dataStore.loadDocument(typeName, entityIRI);
      return resultWithSubjects(result);
    },
    {
      enabled: Boolean(entityIRI && typeIRI && ready) && enabled,
      refetchOnWindowFocus: false,
      ...queryOptionsRest,
    },
  );

  const removeMutation = useMutation(
    ["remove", entityIRI],
    async () => {
      if (!entityIRI || !ready) {
        throw new Error("entityIRI or updateFetch is not defined");
      }
      const typeName = dataStore.typeIRItoTypeName(typeIRI);
      return await dataStore.removeDocument(typeName, entityIRI);
    },
    {
      onSuccess: async () => {
        console.log("invalidateQueries");
        queryClient.invalidateQueries(["list"]);
        queryClient.invalidateQueries(
          filterUndefOrNull(["allEntries", typeIRI || undefined]),
        );
      },
    },
  );

  const saveMutation = useMutation(
    ["save", entityIRI],
    async (data: Record<string, any>) => {
      if (!Boolean(allowUnsafeSourceIRIs)) {
        if (!entityIRI || !typeIRI || !ready)
          throw new Error(
            "entryIRI or typeIRI not defined, will continue anyway",
          );
      }
      const dataWithId: NamedAndTypedEntity = {
        ...data,
        ...(entityIRI ? { "@id": entityIRI } : {}),
        ...(typeIRI ? { "@type": typeIRI } : {}),
      } as NamedAndTypedEntity;
      const { "@id": _entityIRI, "@type": _typeIRI } = dataWithId;
      const cleanData = await cleanJSONLD(dataWithId, schema, {
        jsonldContext,
        defaultPrefix,
        keepContext: true,
      });
      const typeName = dataStore.typeIRItoTypeName(_typeIRI);
      await dataStore.upsertDocument(typeName, _entityIRI, cleanData);
      const { "@context": context, ...cleanDataWithoutContext } = cleanData;
      return cleanDataWithoutContext;
    },
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(["load", entityIRI]);
        await queryClient.invalidateQueries(["show", entityIRI]);
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
      if (!entityIRI || !typeIRI || !ready) return null;
      const typeName = dataStore.typeIRItoTypeName(typeIRI);
      return await dataStore.existsDocument(typeName, entityIRI);
    },
    {
      enabled: Boolean(entityIRI && typeIRI && ready) && enabled,
      refetchOnWindowFocus: false,
      ...queryOptionsRest,
    },
  );

  const loadEntity = useCallback(
    async (entityIRI: string, typeIRI: string) => {
      return queryClient.fetchQuery(
        [loadQueryKey, typeIRI, entityIRI],
        async () => {
          const typeName = dataStore.typeIRItoTypeName(typeIRI);
          const result = await dataStore.loadDocument(typeName, entityIRI);
          return resultWithSubjects(result);
        },
      );
    },
    [loadQueryKey, dataStore.loadDocument, queryClient],
  );

  return {
    loadEntity,
    loadQuery,
    existsQuery,
    removeMutation,
    saveMutation,
  };
};
