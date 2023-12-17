import { variable } from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import {
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../../form/formConfigs";
import { primaryFields, typeIRItoTypeName } from "../../config";

export const searchEntityByLabel = async (
  label: string,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  limit: number = 10,
) => {
  const subjectV = variable("subject");
  const typeName = typeIRItoTypeName(typeIRI);
  const primaryField = primaryFields[typeName];
  const labelField = primaryField?.label || "label";
  const escapedLabel = label.replace(/"/g, '\\"');
  let query = SELECT.DISTINCT` ${subjectV}`.WHERE`
    ${subjectV} :${labelField} "${escapedLabel}" .
    ${subjectV} a <${typeIRI}> .
  `
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
