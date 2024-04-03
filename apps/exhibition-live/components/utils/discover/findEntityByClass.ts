import df from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";

import {
  defaultPrefix,
  defaultQueryBuilderOptions,
} from "../../form/formConfigs";

export function fixSparqlOrder(sparqlQuery) {
  const regex = /(ORDER BY\s+[^ ]+)(\s*)GROUP BY\s+\(([^\)]+)\)/gm;
  return sparqlQuery.replace(regex, "GROUP BY $3 $2\n$1");
}
export const findEntityByClass: (
  searchString: string | null,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  limit?: number,
) => Promise<any> = async (
  searchString: string | null,
  typeIRI: string,
  doQuery: (query: string) => Promise<any>,
  limit: number = 10,
) => {
  const subjectV = df.variable("subject"),
    nameV = df.variable("name"),
    titleV = df.variable("title"),
    allDescriptionV = df.variable("allDescription"),
    descriptionV = df.variable("description"),
    concatenatedV = df.variable("concatenated"),
    safeNameV = df.variable("safeName"),
    safeTitleV = df.variable("safeTitle"),
    safeDescriptionV = df.variable("safeDescription"),
    oneOfTitleV = df.variable("oneOfTitle"),
    firstOneOfTitleV = df.variable("firstOneOfTitle"),
    allImagesV = df.variable("allImages"),
    imageV = df.variable("image");

  let query =
    searchString && searchString.length > 0
      ? SELECT.DISTINCT` ${subjectV} (SAMPLE(${oneOfTitleV}) AS ${firstOneOfTitleV}) (SAMPLE(${allImagesV}) AS ${imageV}) (SAMPLE(${allDescriptionV}) AS ${descriptionV})`
          .WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${allDescriptionV} .}
            OPTIONAL {${subjectV} :image ${allImagesV} .}

            BIND (COALESCE(${nameV}, "") AS ${safeNameV})
            BIND (COALESCE(${titleV}, "") AS ${safeTitleV})
            BIND (COALESCE(${descriptionV}, "") AS ${safeDescriptionV})

            BIND (CONCAT(${safeNameV}, " ", ${safeTitleV}, " ", ${safeDescriptionV}) AS ${concatenatedV})
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER(contains(lcase(${concatenatedV}), lcase("${searchString}") )) .
            FILTER isIRI(${subjectV})
            FILTER (strlen(${oneOfTitleV}) > 0)
        `
          .LIMIT(limit)
          .GROUP()
          .BY(subjectV)
          .ORDER()
          .BY(firstOneOfTitleV)
          .build(defaultQueryBuilderOptions)
      : SELECT.DISTINCT` ${subjectV} (SAMPLE(${oneOfTitleV}) AS ${firstOneOfTitleV}) (SAMPLE(${allImagesV}) AS ${imageV}) (SAMPLE(${allDescriptionV}) AS ${descriptionV})`
          .WHERE`
          ${subjectV} a <${typeIRI}> .
            OPTIONAL {${subjectV} :name ${nameV} .}
            OPTIONAL {${subjectV} :title ${titleV} .}
            OPTIONAL {${subjectV} :description ${allDescriptionV} .}
            OPTIONAL {${subjectV} :image ${allImagesV} .}
            BIND (COALESCE(${nameV}, ${titleV}, ${descriptionV}, "") AS ${oneOfTitleV})
            FILTER isIRI(${subjectV})
            FILTER (strlen(${oneOfTitleV}) > 0)
        `
          .LIMIT(limit)
          .GROUP()
          .BY(subjectV)
          .ORDER()
          .BY(firstOneOfTitleV)
          .build(defaultQueryBuilderOptions);
  query = `PREFIX : <${defaultPrefix}>
          ${fixSparqlOrder(query)}
          `;
  try {
    const bindings = await doQuery(query);
    return bindings.map((binding: any) => ({
      name: binding[firstOneOfTitleV.value]?.value,
      value: binding[subjectV.value]?.value,
      image: binding[imageV.value]?.value,
      description: binding[descriptionV.value]?.value,
    }));
  } catch (e) {
    console.error("Error finding entity by class", e);
    return [];
  }
};
