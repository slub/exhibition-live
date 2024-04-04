import datasetFactory from "@rdfjs/dataset";
import { WorkerResult } from "async-oxigraph";
import N3 from "n3";
import { useCallback, useMemo } from "react";

import { SparqlEndpoint, useSettings } from "./useLocalSettings";
import { useOxigraph } from "./useOxigraph";
import { CRUDFunctions } from "@slub/edb-core-types";
import {
  allegroCrudOptions,
  oxigraphCrudOptions,
  qleverCrudOptions,
} from "@slub/remote-query-implementations";

type UseGlobalCRUDOptions = () => {
  crudOptions?: CRUDFunctions;
  doLocalQuery: (query: string, mimeType?: string) => Promise<WorkerResult>;
};

type DoQuery = (query: string, mimeType?: string) => Promise<WorkerResult>;
const localWorkerCRUD = (
  _endpointConfig: SparqlEndpoint,
  options: { doQuery: DoQuery },
): CRUDFunctions => {
  const doQuery = options.doQuery;
  return {
    askFetch: async (query) => Boolean(await doQuery(query)),
    // @ts-ignore
    constructFetch: async (query) => {
      const result = await doQuery(query, "application/turtle");
      console.log({ result });
      if (!result?.data) return;
      const reader = new N3.Parser();
      return await datasetFactory.dataset(reader.parse(result.data));
    },
    // @ts-ignore
    updateFetch: (query) => doQuery(query),
    selectFetch: async (query, options) => {
      const result = await doQuery(query);
      return options?.withHeaders
        ? result?.data
        : result?.data?.results?.bindings;
    },
  };
};

const workerProvider: Record<
  SparqlEndpoint["provider"],
  <T = Record<string, any>>(
    endpointConfig: SparqlEndpoint,
    options?: T,
  ) => CRUDFunctions | null
> = {
  oxigraph: oxigraphCrudOptions,
  allegro: allegroCrudOptions,
  worker: localWorkerCRUD as any,
  qlever: qleverCrudOptions,
  virtuoso: oxigraphCrudOptions,
  blazegraph: oxigraphCrudOptions,
  rest: null,
};

const getProviderOrDefault = (endpoint: SparqlEndpoint) =>
  typeof workerProvider[endpoint.provider] === "function"
    ? workerProvider[endpoint.provider]
    : oxigraphCrudOptions;

export const useGlobalCRUDOptions: UseGlobalCRUDOptions = () => {
  const { activeEndpoint } = useSettings();
  const { oxigraph, init } = useOxigraph();
  const doQuery = useCallback(
    async (query: string, mimeType?: string) => {
      if (!oxigraph) {
        await init();
        throw new Error("Oxigraph not initialized");
      }
      return await oxigraph.ao.query(query);
    },
    [oxigraph, init],
  );

  const crudOptions = useMemo<CRUDFunctions | undefined>(() => {
    return (
      activeEndpoint &&
      getProviderOrDefault(activeEndpoint)(
        activeEndpoint,
        activeEndpoint.provider === "worker" ? { doQuery } : undefined,
      )
    );
  }, [doQuery, activeEndpoint]);
  return {
    crudOptions,
    doLocalQuery: doQuery,
  };
};
