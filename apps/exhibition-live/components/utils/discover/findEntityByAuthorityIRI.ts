import { variable } from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import {
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../../form/formConfigs";

export const findEntityByAuthorityIRI = async (
  authorityIRI: string,
  typeIRI: string | undefined,
  doQuery: (query: string) => Promise<any>,
  limit: number = 10,
) => {
  const subjectV = variable("subject");
  let query = (
    typeIRI
      ? SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :idAuthority <${authorityIRI}> .
    ${subjectV} a <${typeIRI}> .
  `
      : SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :idAuthority <${authorityIRI}> .
  `
  )
    .LIMIT(limit)
    .build(defaultQueryBuilderOptions);

  query = `PREFIX : <${defaultPrefix}>
  ${query}`;

  try {
    const bindings = await doQuery(query);
    return bindings.map((binding: any) => binding.subject.value);
  } catch (e) {
    console.error("Error finding entity by authority IRI", e);
    return [];
  }
};
