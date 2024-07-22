import { SparqlEndpoint, SPARQLFlavour } from "@slub/edb-core-types";

export const getSPARQLFlavour = (endpoint?: SparqlEndpoint): SPARQLFlavour => {
  switch (endpoint?.provider) {
    case "oxigraph":
      return "oxigraph";
    case "blazegraph":
      return "blazegraph";
    case "allegro":
      return "allegro";
    default:
      return "default";
  }
};
