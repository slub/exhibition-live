import df from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import { QueryBuilderOptions } from "@slub/edb-core-types";

export type FindEntityByAuthorityIRIFn = (
  authorityIRI: string,
  typeIRI: string | undefined,
  doQuery: (query: string) => Promise<any>,
  limit: number,
  options: QueryBuilderOptions,
) => Promise<string[]>;
export const findEntityByAuthorityIRI = async (
  authorityIRI: string,
  typeIRI: string | undefined,
  doQuery: (query: string) => Promise<any>,
  limit: number = 10,
  options: QueryBuilderOptions,
) => {
  const { prefixes, defaultPrefix } = options;
  const subjectV = df.variable("subject");
  let query = (
    typeIRI
      ? SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :idAuthority/:id <${authorityIRI}> .
    ${subjectV} a <${typeIRI}> .
  `
      : SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :idAuthority/:id <${authorityIRI}> .
  `
  )
    .LIMIT(limit)
    .build({ prefixes });

  query = `PREFIX : <${defaultPrefix}>
  ${query}`;
  const bindings = await doQuery(query);
  return bindings.map((binding: any) => binding.subject.value);
};
