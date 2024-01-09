import { Variable } from "@rdfjs/types";

export const makeSPARQLWherePart = (
  entityIRI: string | string[],
  typeIRI: string,
  subject: string | Variable = "?subject",
) => {
  const s = typeof subject === "string" ? subject : `?${subject.value}`;
  const entityIRIList = Array.isArray(entityIRI) ? entityIRI : [entityIRI];
  if (entityIRIList.length === 0) {
    throw new Error("entityIRIList is empty, would result in invalid SPARQL");
  }
  const entityIRIValueString = `<${entityIRIList.join("> <")}>`;
  return typeIRI
    ? ` ${s} a <${typeIRI}> . VALUES ${s} { ${entityIRIValueString} } `
    : ` ${s} a ?type . VALUES ${s} { ${entityIRIValueString} } `;
};

export const withDefaultPrefix = (prefix: string, query: string) =>
  ` PREFIX : <${prefix}> ${query} `;
