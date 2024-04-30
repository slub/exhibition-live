import { makeSPARQLWherePart } from ".";
import { SELECT } from "@tpluscode/sparql-builder";
import { Variable } from "@rdfjs/types";
import df from "@rdfjs/data-model";
import { PrimaryField, SparqlBuildOptions } from "@slub/edb-core-types";

type FieldIriWithVar = {
  predicate: string;
  variable: Variable;
};
export const basicFieldsQuery: (
  entityIRI: string,
  typeIRI: string,
  queryBuildOptions?: SparqlBuildOptions,
) => string = (entityIRI, typeIRI, queryBuildOptions) => {
  const { typeIRItoTypeName, propertyToIRI, primaryFields } = queryBuildOptions;
  const wherePart = makeSPARQLWherePart(entityIRI, typeIRI);
  const typeName = typeIRItoTypeName(typeIRI);
  const fieldDecl = primaryFields[typeName] as PrimaryField | undefined;
  const subject = df.variable("subject");
  const fieldIRIs: FieldIriWithVar[] = Object.entries(fieldDecl).map(
    ([key, field]) => ({
      predicate: propertyToIRI(field),
      variable: df.variable(key),
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
