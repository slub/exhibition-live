import namespace from "@rdfjs/namespace";
import { NamespaceBuilderPrefixes } from "@slub/edb-core-types";
import { v4 as uuidv4 } from "uuid";

export const sladb = namespace("http://ontologies.slub-dresden.de/exhibition#");
export const slent = namespace(
  "http://ontologies.slub-dresden.de/exhibition/entity/",
);
export const defaultPrefix = sladb[""].value;
export const defaultJsonldContext = {
  "@vocab": defaultPrefix,
  xs: "http://www.w3.org/2001/XMLSchema#",
  image: {
    "@type": "xs:anyURI",
  },
};

export const defaultQueryBuilderOptions: NamespaceBuilderPrefixes = {
  prefixes: { [""]: sladb, slent: slent },
};

export const createNewIRI = () => slent(uuidv4()).value;
