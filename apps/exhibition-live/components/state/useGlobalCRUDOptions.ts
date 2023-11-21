import datasetFactory from "@rdfjs/dataset";
import { WorkerResult } from "async-oxigraph";
import N3 from "n3";
import { useCallback, useEffect, useState } from "react";

import { oxigraphCrudOptions } from "../utils/sparql/remoteOxigraph";
import { allegroCrudOptions } from "../utils/sparql/remoteAllegro";
import { SparqlEndpoint, useSettings } from "./useLocalSettings";
import { useOxigraph } from "./useOxigraph";
import { CRUDFunctions } from "./useSPARQL_CRUD";
import { qleverCrudOptions } from "../utils/sparql/remoteQlever";

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
  ) => CRUDFunctions
> = {
  oxigraph: oxigraphCrudOptions,
  allegro: allegroCrudOptions,
  worker: localWorkerCRUD as any,
  qlever: qleverCrudOptions,
  virtuoso: oxigraphCrudOptions,
  blazegraph: oxigraphCrudOptions,
};

const getProviderOrDefault = (endpoint: SparqlEndpoint) =>
  typeof workerProvider[endpoint.provider] === "function"
    ? workerProvider[endpoint.provider]
    : oxigraphCrudOptions;

export const useGlobalCRUDOptions: UseGlobalCRUDOptions = () => {
  const { activeEndpoint } = useSettings();
  const [crudOptions, setCrudOptions] = useState<CRUDFunctions | undefined>();
  const { oxigraph, init } = useOxigraph();
  const doQuery = useCallback(
    async (query: string, mimeType?: string) => {
      if (!oxigraph) {
        await init();
        throw new Error("Oxigraph not initialized");
      }
      return await oxigraph.ao.query(query);
    },
    [oxigraph],
  );

  useEffect(() => {
    setCrudOptions(
      activeEndpoint &&
        getProviderOrDefault(activeEndpoint)(
          activeEndpoint,
          activeEndpoint.provider === "worker" ? { doQuery } : undefined,
        ),
    );
  }, [doQuery, activeEndpoint?.endpoint, activeEndpoint?.auth, setCrudOptions]);
  return {
    crudOptions,
    doLocalQuery: doQuery,
  };
};
