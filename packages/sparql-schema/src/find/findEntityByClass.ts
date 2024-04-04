import df from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import { QueryOptions } from "@slub/edb-core-types";

export const fixSparqlOrder: (sparqlQuery: string) => string = (
  sparqlQuery,
) => {
  const regex = /(ORDER BY\s+[^ ]+)(\s*)GROUP BY\s+\(([^\)]+)\)/gm;
  return sparqlQuery.replace(regex, "GROUP BY $3 $2\n$1");
};
export const findEntityByClass: (
  searchString: string | null,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  options: QueryOptions,
  limit?: number,
) => Promise<any> = async (
  searchString: string | null,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  options,
  limit?: number,
) => {
  const { queryBuildOptions, defaultPrefix } = options;
  const subjectV = df.variable("subject"),
    nameV = df.variable("name"),
    titleV = df.variable("title"),
    descriptionV = df.variable("description"),
    concatenatedV = df.variable("concatenated"),
    safeNameV = df.variable("safeName"),
    safeTitleV = df.variable("safeTitle"),
    safeDescriptionV = df.variable("safeDescription"),
    oneOfTitleV = df.variable("oneOfTitle"),
    firstOneOfTitleV = df.variable("firstOneOfTitle");
  let query =
    searchString && searchString.length > 0
      ? SELECT.DISTINCT` ${subjectV} (SAMPLE(${oneOfTitleV}) AS ${firstOneOfTitleV})`
          .WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${descriptionV} .}

            BIND (COALESCE(${nameV}, "") AS ${safeNameV})
            BIND (COALESCE(${titleV}, "") AS ${safeTitleV})
            BIND (COALESCE(${descriptionV}, "") AS ${safeDescriptionV})

            BIND (CONCAT(${safeNameV}, " ", ${safeTitleV}, " ", ${safeDescriptionV}) AS ${concatenatedV})
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER(contains(lcase(${concatenatedV}), lcase("${searchString}") )) .
            FILTER isIRI(${subjectV})
            FILTER (strlen(${oneOfTitleV}) > 0)
        `
      : SELECT.DISTINCT` ${subjectV} (SAMPLE(${oneOfTitleV}) AS ${firstOneOfTitleV})`
          .WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${descriptionV} .}
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER isIRI(${subjectV})
            FILTER (strlen(${oneOfTitleV}) > 0)
        `;
  if (typeof limit === "number") query = query.LIMIT(limit);
  query = query.GROUP().BY(subjectV).ORDER().BY(firstOneOfTitleV);
  const queryString = `PREFIX : <${defaultPrefix}>
          ${fixSparqlOrder(query.build(queryBuildOptions))}
          `;
  try {
    const bindings = await doQuery(queryString);
    return bindings.map((binding: any) => ({
      name: binding[firstOneOfTitleV.value]?.value,
      value: binding[subjectV.value]?.value,
    }));
  } catch (e) {
    console.error("Error finding entity by class", e);
    return [];
  }
};
