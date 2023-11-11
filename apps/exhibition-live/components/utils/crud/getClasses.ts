import { variable } from "@rdfjs/data-model";
import { SELECT } from "@tpluscode/sparql-builder";
import { SPARQLCRUDOptions } from "./types";

export const getClasses = async (
  entityIRI: string,
  selectFetch: (query: string) => Promise<any>,
  options: SPARQLCRUDOptions,
): Promise<string[] | null> => {
  const { queryBuildOptions } = options;
  const classes = variable("classes");
  const query = SELECT`${classes}`.WHERE`
      <${entityIRI}> a ${classes} .
    `.build(queryBuildOptions);
  try {
    const result = await selectFetch(query);
    return result.map(({ classes }) => classes.value);
  } catch (e) {
    console.error(e);
  }
  return null;
};
