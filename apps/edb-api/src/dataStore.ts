import config from "@slub/exhibition-sparql-config";
import {
  getProviderOrDefault,
  getSPARQLFlavour,
} from "@slub/remote-query-implementations";
import { initSPARQLDataStoreFromConfig } from "@slub/sparql-db-impl";

const worker = getProviderOrDefault(config.sparqlEndpoint);

if (!worker) {
  throw new Error("No worker found for the given SPARQL endpoint");
}
export const dataStore = initSPARQLDataStoreFromConfig(
  config,
  worker(config.sparqlEndpoint),
  getSPARQLFlavour(config.sparqlEndpoint),
);

export const typeNameToTypeIRI = (typeName: string) =>
  config.namespace(typeName).value;

export const typeIRItoTypeName = (iri: string) => {
  return iri?.substring(config.BASE_IRI.length, iri.length);
};
