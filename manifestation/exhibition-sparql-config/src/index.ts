import namespace from "@rdfjs/namespace";
import { Config } from "@slub/edb-global-types";

const BASE_IRI = "http://ontologies.slub-dresden.de/exhibition#";
export const sladb = namespace(BASE_IRI);
export const slent = namespace(
  `http://ontologies.slub-dresden.de/exhibition/entity#`,
);
export const defaultPrefix = sladb[""].value;

export default {
  BASE_IRI,
  namespaceBase: "http://ontologies.slub-dresden.de/exhibition#",
  namespace: namespace("http://ontologies.slub-dresden.de/exhibition#"),
  defaultPrefix: "http://ontologies.slub-dresden.de/exhibition#",
  walkerOptions: {
    maxRecursion: 6,
    maxRecursionEachRef: 6,
    skipAtLevel: 10,
    omitEmptyArrays: true,
    omitEmptyObjects: true,
  },
  defaultJsonldContext: {
    "@vocab": defaultPrefix,
    xs: "http://www.w3.org/2001/XMLSchema#",
    id: {
      "@type": "@id",
    },
    image: {
      "@type": "xs:anyURI",
    },
  },
  defaultQueryBuilderOptions: {
    prefixes: { [""]: sladb, slent },
  },
  sparqlEndpoint: {
    label: "Ausstellungsdatenbank Lokal",
    endpoint: "http://localhost:7878/query",
    provider: "oxigraph",
    active: true,
  },
} as Config;
