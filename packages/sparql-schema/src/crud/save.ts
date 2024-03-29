import N3 from "n3";
import Parser from "@rdfjs/parser-jsonld";
import { INSERT } from "@tpluscode/sparql-builder";
import { withDefaultPrefix } from "./makeSPARQLWherePart";
import { JSONSchema7 } from "json-schema";
import { makeSPARQLDeleteQuery } from "./makeSPARQLDeleteQuery";
import { NamedAndTypedEntity, SPARQLCRUDOptions } from "@slub/edb-core-types";
import dsExt from "rdf-dataset-ext";
import datasetFactory from "@rdfjs/dataset";
import stringToStream from "string-to-stream";
import { dataset2NTriples } from "./dataset2NTriples";
import { jsonld2DataSet } from "./jsonld2DataSet";

type SaveOptions = SPARQLCRUDOptions & {
  skipRemove?: boolean;
};
export const save = async (
  dataToBeSaved: NamedAndTypedEntity,
  schema: JSONSchema7,
  updateFetch: (query: string) => Promise<any>,
  options: SaveOptions,
) => {
  const { skipRemove, queryBuildOptions, defaultPrefix } = options;
  const entityIRI = dataToBeSaved["@id"];
  const typeIRI = dataToBeSaved["@type"];
  const ds = await jsonld2DataSet(dataToBeSaved);
  const ntriples = await dataset2NTriples(ds);
  const insertQuery = withDefaultPrefix(
    defaultPrefix,
    INSERT.DATA` ${ntriples} `.build(queryBuildOptions),
  );

  if (skipRemove) {
    return await updateFetch(insertQuery);
  }

  const deleteQuery = makeSPARQLDeleteQuery(
    entityIRI,
    typeIRI,
    schema,
    options,
  );
  try {
    await updateFetch(deleteQuery);
  } catch (e) {
    throw new Error("unable to delete the entry - DELETE query failed", {
      cause: e,
    });
  }
  return await updateFetch(insertQuery);
};
