export const makeSPARQLWherePart = (entityIRI: string, typeIRI: string) =>
  ` <${entityIRI}> a <${typeIRI}> . `;

export const withDefaultPrefix = (prefix: string, query: string) =>
  ` PREFIX : <${prefix}> ${query} `;
