import { JSONSchema7 } from "json-schema";
import {
  DSProcessingOptions,
  processAllDocumentsFromDataset,
} from "@slub/edb-maintenance-utils";
import mime from "mime-types";
import { DatasetCore, Quad } from "@rdfjs/types";
import datasetFactory from "@rdfjs/dataset";
import N3 from "n3";
import * as fs from "fs";
import jsonld from "jsonld";

export const processEachDocumentFromFile = async (
  file: string,
  schema: JSONSchema7,
  onDocument: (
    entityIRI: string,
    typeIRI: string,
    document: any,
  ) => Promise<void>,
  options: DSProcessingOptions,
) => {
  const mimeType = mime.lookup(file);
  let ds: DatasetCore | null = null;
  switch (mimeType) {
    case "text/turtle":
    case "application/n-triples":
      const reader = new N3.Parser();
      ds = datasetFactory.dataset(reader.parse(fs.readFileSync(file, "utf-8")));
      break;
    case "application/json":
      const quads = (await jsonld.toRDF(
        JSON.parse(fs.readFileSync(file, "utf-8")),
      )) as Quad[];
      ds = datasetFactory.dataset(quads);
      break;
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
  if (ds === null) {
    throw new Error("Unable to parse the data");
  }
  return await processAllDocumentsFromDataset(ds, schema, onDocument, options);
};
