import { BASE_IRI } from "./paths";

export const typeIRItoTypeName = (iri: string) => {
  return iri?.substring(BASE_IRI.length, iri.length);
};
