import { makeSPARQLWherePart } from "./makeSPARQLWherePart";
import { primaryFields, typeIRItoTypeName } from "../../config";
import { PrimaryField } from "../types";
import { sladb } from "../../form/formConfigs";
import { SELECT } from "@tpluscode/sparql-builder";
import { Variable } from "@rdfjs/types";
import { variable } from "@rdfjs/data-model";
import { SparqlBuildOptions } from "../../state/useSPARQL_CRUD";

type FieldIriWithVar = {
  predicate: string;
  variable: Variable;
};
export const basicFieldsQuery: (
  entityIRI: string,
  typeIRI: string,
  queryBuildOptions?: SparqlBuildOptions,
) => string = (entityIRI, typeIRI, queryBuildOptions) => {
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI);
  const typeName = typeIRItoTypeName(typeIRI);
  const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
  const subject = variable("subject");
  const fieldIRIs: FieldIriWithVar[] = Object.entries(fieldDecl).map(
    ([key, field]) => ({
      predicate: sladb(field).value,
      variable: variable(key),
    }),
  );
  const query = SELECT`${subject} ${fieldIRIs.map(({ variable }) => variable)}`
    .WHERE`
    ${wherePart}
    ${fieldIRIs.map(
      ({ predicate, variable }) =>
        `OPTIONAL { ?${subject.value} <${predicate}> ?${variable.value} . } `,
    )}`.build(queryBuildOptions);
  return query;
};