import namespace from "@rdfjs/namespace";
import { SparqlBuildOptions } from "@slub/edb-core-types";
import { v4 as uuidv4 } from "uuid";
import {
  primaryFieldExtracts,
  primaryFields,
  typeIRItoTypeName,
} from "../config";

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

export const defaultQueryBuilderOptions: SparqlBuildOptions = {
  prefixes: { [""]: sladb[""].value, slent: slent[""].value },
  propertyToIRI: (property: string) => {
    return sladb[property].value;
  },
  typeIRItoTypeName: typeIRItoTypeName,
  primaryFields: primaryFields,
  primaryFieldExtracts: primaryFieldExtracts,
};

export const createNewIRI = () => slent(uuidv4()).value;
