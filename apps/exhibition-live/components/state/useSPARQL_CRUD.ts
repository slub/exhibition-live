import { NamespaceBuilder } from "@rdfjs/namespace";
import {
  Bindings,
  Dataset,
  DatasetCore,
  Quad,
  ResultStream,
} from "@rdfjs/types";
import {
  QueryObserverOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ASK, CONSTRUCT, DELETE, INSERT } from "@tpluscode/sparql-builder";
import { JSONSchema7 } from "json-schema";
import jsonld from "jsonld";
import N3 from "n3";
import { useCallback, useEffect, useState } from "react";

import {
  jsonSchemaGraphInfuser,
  WalkerOptions,
} from "../utils/graph/jsonSchemaGraphInfuser";
import { jsonSchema2construct } from "../utils/sparql";
import { useQueryKeyResolver } from "./useQueryKeyResolver";

export interface SparqlBuildOptions {
  base?: string;
  prefixes?: Record<string, string | NamespaceBuilder>;
}

export interface SelectFetchOptions {
  withHeaders?: boolean;
}

export type CRUDFunctions = {
  updateFetch: (
    query: string,
  ) => Promise<
    | ResultStream<any>
    | boolean
    | void
    | ResultStream<Bindings>
    | ResultStream<Quad>
  >;
  constructFetch: (query: string) => Promise<DatasetCore>;
  selectFetch: (query: string, options?: SelectFetchOptions) => Promise<any>;
  askFetch: (query: string) => Promise<boolean>;
};

export type CRUDOptions = CRUDFunctions & {
  defaultPrefix: string;
  data: any;
  setData: (data: any, isRefetch: boolean) => void;
  walkerOptions?: Partial<WalkerOptions>;
  queryBuildOptions?: SparqlBuildOptions;
  upsertByDefault?: boolean;
  ready?: boolean;
  onLoad?: (data: any) => void;
  queryOptions?: QueryObserverOptions<any, Error>;
};

export const useSPARQL_CRUD = (
  entityIRI: string | undefined,
  typeIRI: string | undefined,
  schema: JSONSchema7,
  {
    askFetch,
    constructFetch,
    defaultPrefix,
    updateFetch,
    setData,
    data,
    walkerOptions = {},
    queryBuildOptions,
    upsertByDefault,
    onLoad,
    queryOptions,
  }: CRUDOptions,
) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [whereEntity, setWhereEntity] = useState<string | undefined>();
  const { updateSourceToTargets, removeSource, resolveSourceIRIs } =
    useQueryKeyResolver();
  const [lastEntityLoaded, setLastEntityLoaded] = useState<
    string | undefined
  >();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!entityIRI) return;
    const _whereEntity = ` <${entityIRI}> a <${typeIRI}> . `;
    setWhereEntity(_whereEntity);
    return () => {
      resolveSourceIRIs(entityIRI);
    };
  }, [entityIRI, typeIRI, setWhereEntity]);

  const exists = useCallback(async () => {
    if (!whereEntity) return false;
    const query = ASK`${whereEntity}`.build(queryBuildOptions);
    try {
      return await askFetch(query);
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [whereEntity, setIsUpdate, defaultPrefix, askFetch]);

  const load = useCallback(async () => {
    if (!entityIRI || !whereEntity) return;
    const { construct, whereRequired, whereOptionals } = jsonSchema2construct(
      entityIRI,
      schema,
      [],
      ["@id", "@type"],
    );
    let query = CONSTRUCT`${construct}`.WHERE`
                ${whereEntity}
                ${whereRequired}
                ${whereOptionals}
                `.build(queryBuildOptions);
    query = `PREFIX : <${defaultPrefix}> ` + query;
    try {
      const ds = await constructFetch(query);
      const subjects: Set<string> = new Set();
      // @ts-ignore
      for (const quad of ds) {
        if (quad.subject.termType === "NamedNode") {
          subjects.add(quad.subject.value);
        }
      }
      updateSourceToTargets(entityIRI, Array.from(subjects));
      const resultJSON = jsonSchemaGraphInfuser(
        defaultPrefix,
        entityIRI,
        ds as Dataset,
        schema,
        walkerOptions,
      );
      setIsUpdate(true);
      //setData(resultJSON)
      onLoad && onLoad(resultJSON);
      return resultJSON;
    } catch (e) {
      console.error(e);
    }
  }, [
    entityIRI,
    whereEntity,
    setIsUpdate,
    defaultPrefix,
    constructFetch,
    updateSourceToTargets,
  ]);

  const remove = useCallback(async () => {
    if (!entityIRI || !whereEntity) return;
    const { construct, whereRequired, whereOptionals } = jsonSchema2construct(
      entityIRI,
      schema,
      ["@id"],
      ["@id", "@type"],
    );
    let query = DELETE` ${construct} `
      .WHERE`${whereEntity} ${whereRequired}\n${whereOptionals}`.build(
      queryBuildOptions,
    );
    query = `PREFIX : <${defaultPrefix}> ` + query;
    await updateFetch(query);
  }, [entityIRI, whereEntity, defaultPrefix, updateFetch]);

  const save = useCallback(async () => {
    if (!data || !entityIRI || !whereEntity) return;
    const _data = {
      ...data,
      "@type": typeIRI,
      "@id": entityIRI,
    };
    const ntWriter = new N3.Writer({ format: "Turtle" });
    const ds = await jsonld.toRDF(_data);

    // @ts-ignore
    const ntriples = ntWriter.quadsToString([...ds]).replaceAll("_:_:", "_:");

    if (!isUpdate && !upsertByDefault) {
      const updateQuery = INSERT.DATA` ${ntriples} `;
      const query = updateQuery.build();
      await updateFetch(query);
      setIsUpdate(true);
    } else {
      const { construct, whereRequired, whereOptionals } = jsonSchema2construct(
        entityIRI,
        schema,
        ["@id"],
        ["@id", "@type"],
      );
      const queries = [
        DELETE` ${construct} `
          .WHERE`${whereEntity} ${whereRequired}\n${whereOptionals}`.build(
          queryBuildOptions,
        ),
        INSERT.DATA` ${ntriples} `.build(queryBuildOptions),
      ];
      for (let query of queries) {
        query = `PREFIX : <${defaultPrefix}> ` + query;
        await updateFetch(query);
      }
      for (const sourceIRI of resolveSourceIRIs(entityIRI)) {
        console.log("invalidateQueries", sourceIRI);
        await queryClient.invalidateQueries(["load", sourceIRI]);
      }
    }
  }, [
    entityIRI,
    typeIRI,
    whereEntity,
    data,
    isUpdate,
    setIsUpdate,
    defaultPrefix,
    updateFetch,
    upsertByDefault,
    queryClient,
  ]);

  const reset = useCallback(() => {
    setData({}, false);
    setLastEntityLoaded(undefined);
    load();
  }, [setData, setLastEntityLoaded, load]);
  const handleLoadSuccess = useCallback(
    (data: any) => {
      if (data) {
        setData(data, entityIRI === lastEntityLoaded);
        setLastEntityLoaded(entityIRI);
      }
    },
    [entityIRI, setLastEntityLoaded, lastEntityLoaded, setData],
  );

  const queryResults = useQuery(
    ["load", entityIRI],
    async () => {
      const res = await load();
      return res || null;
    },
    {
      onSuccess: handleLoadSuccess,
      enabled: Boolean(entityIRI && whereEntity),
      refetchOnWindowFocus: false,
      ...queryOptions,
    },
  );
  const { refetch, isLoading } = queryResults;

  return {
    ...queryResults,
    exists,
    load: refetch,
    save,
    remove,
    isUpdate,
    setIsUpdate,
    reset,
    // @ts-ignore
    ready: Boolean(askFetch && constructFetch && updateFetch),
  };
};
