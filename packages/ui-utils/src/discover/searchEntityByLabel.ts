import df from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import {
  IRIToStringFn,
  PrimaryFieldExtractDeclaration,
  QueryBuilderOptions,
} from "@slub/edb-core-types";

type OwnOptions = {
  typeIRItoTypeName: IRIToStringFn;
  primaryFields: PrimaryFieldExtractDeclaration;
};

export const searchEntityByLabel = async (
  label: string,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  limit: number = 10,
  options: QueryBuilderOptions & OwnOptions,
) => {
  const { prefixes, defaultPrefix, typeIRItoTypeName, primaryFields } = options;
  const subjectV = df.variable("subject");
  const typeName = typeIRItoTypeName(typeIRI);
  const primaryField = primaryFields[typeName];
  const labelField = primaryField?.label || "label";
  const escapedLabel = label.replace(/"/g, '\\"');
  let query = SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :${labelField} "${escapedLabel}" .
    ${subjectV} a <${typeIRI}> .
  `
    .LIMIT(limit)
    .build({ prefixes });

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
