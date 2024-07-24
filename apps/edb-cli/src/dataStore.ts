import config from "@slub/exhibition-sparql-config";
import {
  getProviderOrDefault,
  getSPARQLFlavour,
} from "@slub/remote-query-implementations";
import { initSPARQLDataStoreFromConfig } from "@slub/sparql-db-impl";

export const provider = getProviderOrDefault(config.sparqlEndpoint);
if (!provider) {
  throw new Error("No provider found for the given SPARQL endpoint");
}
export const crudFunctions = provider(config.sparqlEndpoint);

export const dataStore = initSPARQLDataStoreFromConfig(
  config,
  crudFunctions,
  getSPARQLFlavour(config.sparqlEndpoint),
);
