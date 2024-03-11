import namespace, {NamespaceBuilder} from "@rdfjs/namespace";
import {Config} from "./types.js";

const BASE_IRI = "http://ontologies.slub-dresden.de/exhibition#"
export const sladb = namespace(BASE_IRI);
export const slent = namespace(
  `${BASE_IRI}/entity/`
);
export const defaultPrefix = sladb[""].value;


export default {
  BASE_IRI,
  API_URL: "http://sdvahndmgtest.slub-dresden.de:8000/graphql",
  namespaceBase: "http://ontologies.slub-dresden.de/exhibition#",
  namespace: namespace("http://ontologies.slub-dresden.de/exhibition#"),
  defaultPrefix: "http://ontologies.slub-dresden.de/exhibition#",
  walkerOptions: {
    maxRecursion: 8,
    maxRecursionEachRef: 8,
    skipAtLevel: 10,
    omitEmptyArrays: true,
    omitEmptyObjects: true,
  },
  defaultJsonldContext: {
    "@vocab": defaultPrefix,
    xs: "http://www.w3.org/2001/XMLSchema#",
    image: {
      "@type": "xs:anyURI",
    },
  },
  defaultQueryBuilderOptions: {
    prefixes: { [""]: sladb, slent }
  },
  sparqlEndpoint: {
    label: "Ausstellungsdatenbank",
    endpoint: "https://ausstellungsdatenbank.kuenste.live/query",
    provider: "oxigraph",
    active: true
  }
} as Config
