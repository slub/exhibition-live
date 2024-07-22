import { SparqlEndpoint, WorkerProvider } from "@slub/edb-core-types";
import { oxigraphCrudOptions } from "./remoteOxigraph";
import { allegroCrudOptions } from "./remoteAllegro";
import { qleverCrudOptions } from "./remoteQlever";

const workerProvider: WorkerProvider = {
  oxigraph: oxigraphCrudOptions,
  allegro: allegroCrudOptions,
  qlever: qleverCrudOptions,
  virtuoso: oxigraphCrudOptions,
  blazegraph: oxigraphCrudOptions,
  worker: null,
  rest: null,
};

export const getProviderOrDefault = (endpoint: SparqlEndpoint) =>
  endpoint.provider && typeof workerProvider[endpoint.provider] === "function"
    ? workerProvider[endpoint.provider]
    : oxigraphCrudOptions;
