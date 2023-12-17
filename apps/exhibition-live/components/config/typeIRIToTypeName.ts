import { BASE_IRI } from "./index";

export const typeIRItoTypeName = (iri: string) => {
  return iri.substring(BASE_IRI.length, iri.length);
};
