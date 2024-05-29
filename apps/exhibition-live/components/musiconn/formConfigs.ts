import namespace from "@rdfjs/namespace";
import { SparqlBuildOptions } from "@slub/edb-core-types";
import { v4 as uuidv4 } from "uuid";
import {
  primaryFieldExtracts,
  primaryFields,
  typeIRItoTypeName,
} from "./index";

export const slmus = namespace("http://ontologies.slub-dresden.de/musiconn#");
export const slmusent = namespace(
  "http://ontologies.slub-dresden.de/musiconn/entity/",
);
export const defaultPrefix = slmus[""].value;
export const defaultJsonldContext = {
  "@vocab": defaultPrefix,
  xs: "http://www.w3.org/2001/XMLSchema#",
  image: {
    "@type": "xs:anyURI",
  },
};

export const defaultQueryBuilderOptions: SparqlBuildOptions = {
  prefixes: { [""]: slmus[""].value, slmusent: slmusent[""].value },
  propertyToIRI: (property: string) => {
    return slmus[property].value;
  },
  typeIRItoTypeName: typeIRItoTypeName,
  primaryFields: primaryFields,
  primaryFieldExtracts: primaryFieldExtracts,
};

export const createNewIRI = () => slmusent(uuidv4()).value;
