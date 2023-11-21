import {Variable} from "@rdfjs/types";

export const makeSPARQLWherePart = (entityIRI: string, typeIRI: string, subject: string | Variable = "?subject") => {
  const s = typeof subject === "string" ? subject : `?${subject.value}`;
  return typeIRI ?
    ` ${s} a <${typeIRI}> . VALUES ${s} { <${entityIRI}> } ` : ` ${s} a ?type . VALUES ${s} { <${entityIRI}> } `;
};

export const withDefaultPrefix = (prefix: string, query: string) =>
  ` PREFIX : <${prefix}> ${query} `;
