import {
  Dataset,
} from "@rdfjs/types";
import {
  QueryObserverOptions,
  QueryObserverResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import {
  ASK,
  CONSTRUCT,
  DELETE,
  INSERT,
  SELECT,
} from "@tpluscode/sparql-builder";
import { JSONSchema7 } from "json-schema";
import jsonld from "jsonld";
import N3 from "n3";
import { useCallback, useEffect, useState } from "react";
import { useSnackbar } from "notistack";

import {
  jsonSchemaGraphInfuser,
} from "../utils/graph/jsonSchemaGraphInfuser";
import { jsonSchema2construct } from "../utils/sparql";
import { useQueryKeyResolver } from "./useQueryKeyResolver";
import df from "@rdfjs/data-model";
import {CRUDFunctions, SparqlBuildOptions} from "@slub/edb-core-types";
import {WalkerOptions} from "@slub/edb-graph-traversal";

type OwnUseCRUDResults = {
  save: (data?: any) => Promise<void>;
  remove: () => Promise<void>;
  exists: () => Promise<boolean>;
  load: () => Promise<QueryObserverResult>;
  reset: () => void;
  getClassIRIs: (entityIRI?: string) => Promise<string[] | null>;
  isUpdate: boolean;
  setIsUpdate: (isUpdate: boolean) => void;
};

export type UseCRUDResults = UseQueryResult<any, Error> & OwnUseCRUDResults;
export type CRUDOptions = CRUDFunctions & {
  defaultPrefix: string;
  data: any;
  setData?: (data: any, isRefetch: boolean) => void;
  walkerOptions?: Partial<WalkerOptions>;
  queryBuildOptions?: SparqlBuildOptions;
  upsertByDefault?: boolean;
  ready?: boolean;
  onLoad?: (data: any) => void;
  queryOptions?: QueryObserverOptions<any, Error>;
  queryKey?: string;
};

export const useSPARQL_CRUD = (
  entityIRI: string | undefined,
  typeIRI: string | undefined,
  schema: JSONSchema7,
  {
    askFetch,
    constructFetch,
    selectFetch,
    defaultPrefix,
    updateFetch,
    setData,
    data,
    walkerOptions = {},
    queryBuildOptions,
    upsertByDefault,
    onLoad,
    queryOptions,
    queryKey = "load",
  }: CRUDOptions,
): UseCRUDResults => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [whereEntity, setWhereEntity] = useState<string | undefined>();
  const { updateSourceToTargets, removeSource, resolveSourceIRIs } =
    useQueryKeyResolver();
  const [lastEntityLoaded, setLastEntityLoaded] = useState<
    string | undefined
  >();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!entityIRI || !typeIRI) return;
    const _whereEntity = ` <${entityIRI}> a <${typeIRI}> . `;
    setWhereEntity(_whereEntity);
    return () => {
      resolveSourceIRIs(entityIRI);
    };
  }, [entityIRI, typeIRI, setWhereEntity, resolveSourceIRIs]);

  const getClassIRIs = useCallback(
    async (entityIRI_: string) => {
      const ownIRI = entityIRI_ || entityIRI;
      if (!ownIRI || !selectFetch) return null;
      const classes = df.variable("classes");
      const query = SELECT`${classes}`.WHERE`
      <${ownIRI}> a ${classes} .
    `.build(queryBuildOptions);
      try {
        const result = await selectFetch(query);
        return result.map(({ classes }) => classes.value);
      } catch (e) {
        console.error(e);
      }
      return null;
    },
    [entityIRI, selectFetch, queryBuildOptions],
  );

  const exists = useCallback(async () => {
    if (!whereEntity) return false;
    const query = ASK`${whereEntity}`.build(queryBuildOptions);
    try {
      return await askFetch(query);
    } catch (e) {
      console.error(e);
    }
    return false;
  }, [whereEntity, askFetch, queryBuildOptions]);

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
    onLoad,
    schema,
    queryBuildOptions,
    walkerOptions,
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
    enqueueSnackbar("Daten wurden entfernt", { variant: "info" });
  }, [
    entityIRI,
    whereEntity,
    defaultPrefix,
    updateFetch,
    enqueueSnackbar,
    queryBuildOptions,
    schema,
  ]);

  //TODO: this code is a mess, refactor it (it has matured historically)
  const save = useCallback(
    async (data_?: any) => {
      let dataToBeSaved = data_;
      const finalEntityIRI = dataToBeSaved?.["@id"] || entityIRI;
      const finalTypeIRI = dataToBeSaved?.["@type"] || typeIRI;
      if (!dataToBeSaved) {
        if (!data || !entityIRI) return;
        dataToBeSaved = {
          ...data,
          "@type": typeIRI,
          "@id": entityIRI,
        };
      }
      const finalWhereEntity = ` <${finalEntityIRI}> a <${finalTypeIRI}> . `;
      const ntWriter = new N3.Writer({ format: "Turtle" });
      const ds = await jsonld.toRDF(dataToBeSaved);

      // @ts-ignore
      const ntriples = ntWriter.quadsToString([...ds]).replaceAll("_:_:", "_:");
      if (!isUpdate && !upsertByDefault) {
        const updateQuery = INSERT.DATA` ${ntriples} `;
        const query = updateQuery.build();
        await updateFetch(query);
        setIsUpdate(true);
      } else {
        const { construct, whereRequired, whereOptionals } =
          jsonSchema2construct(
            finalEntityIRI,
            schema,
            ["@id"],
            ["@id", "@type"],
          );
        const queries = [
          DELETE` ${construct} `
            .WHERE`${finalWhereEntity} ${whereRequired}\n${whereOptionals}`.build(
            queryBuildOptions,
          ),
          INSERT.DATA` ${ntriples} `.build(queryBuildOptions),
        ];
        for (let query of queries) {
          query = `PREFIX : <${defaultPrefix}> ` + query;
          await updateFetch(query);
        }
        // temporary add message here
        enqueueSnackbar("Daten wurden gespeichert", { variant: "success" });
        for (const sourceIRI of resolveSourceIRIs(finalEntityIRI)) {
          await queryClient.invalidateQueries(["load", sourceIRI]);
        }
      }
    },
    [
      entityIRI,
      typeIRI,
      data,
      isUpdate,
      setIsUpdate,
      defaultPrefix,
      updateFetch,
      upsertByDefault,
      queryClient,
      enqueueSnackbar,
      resolveSourceIRIs,
      schema,
      queryBuildOptions,
    ],
  );

  const reset = useCallback(() => {
    setData && setData({}, false);
    setLastEntityLoaded(undefined);
    load();
    enqueueSnackbar("Daten wurden zurückgesetzt", { variant: "info" });
  }, [setData, setLastEntityLoaded, load, enqueueSnackbar]);
  const handleLoadSuccess = useCallback(
    (data: any) => {
      if (data) {
        setData && setData(data, entityIRI === lastEntityLoaded);
        setLastEntityLoaded(entityIRI);
      }
    },
    [entityIRI, setLastEntityLoaded, lastEntityLoaded, setData],
  );

  const { enabled, ...queryOptionsRest } = queryOptions || {};
  const queryResults = useQuery(
    ["oldLoad", entityIRI],
    async () => {
      const res = await load();
      return res || null;
    },
    {
      onSuccess: handleLoadSuccess,
      enabled: Boolean(entityIRI && whereEntity) && enabled,
      refetchOnWindowFocus: false,
      ...queryOptionsRest,
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
    getClassIRIs,
    setIsUpdate,
    reset,
    // @ts-ignore
    ready: Boolean(askFetch && constructFetch && updateFetch),
  };
};
