import { Dataset, DatasetCore } from "@rdfjs/types";
import { JSONSchema7 } from "json-schema";
import { defs } from "@slub/json-schema-utils";
import { rdf } from "@tpluscode/rdf-ns-builders";
import df from "@rdfjs/data-model";
import {
  traverseGraphExtractBySchema,
  WalkerOptions,
} from "@slub/edb-graph-traversal";
import { IRIToStringFn, SPARQLCRUDOptions } from "@slub/edb-core-types";
import type { JsonLdContext } from "jsonld-context-parser";

type ImportOptions = SPARQLCRUDOptions & {
  walkerOptions?: Partial<WalkerOptions>;
  jsonldContext?: JsonLdContext;
  typeNameToTypeIRI: IRIToStringFn;
};
export const importAllDocumentsFromDataset = async (
  ds: DatasetCore,
  schema: JSONSchema7,
  onDocument: (
    entityIRI: string,
    typeIRI: string,
    document: any,
  ) => Promise<void>,
  options: ImportOptions,
) => {
  const { walkerOptions, typeNameToTypeIRI } = options;
  const classes = Object.keys(defs(schema)).map((key) =>
    typeNameToTypeIRI(key),
  );
  const subjects: Set<string> = new Set();
  for (const typeIRI of classes) {
    const quads = ds.match(null, rdf.type, df.namedNode(typeIRI));
    for (const q of quads) {
      const entityIRI = q.subject.value;
      if (subjects.has(entityIRI)) continue; // skip
      subjects.add(q.subject.value);
      const document = traverseGraphExtractBySchema(
        options.defaultPrefix,
        entityIRI,
        ds as Dataset,
        schema,
        walkerOptions,
      );
      await onDocument(entityIRI, typeIRI, document);
    }
  }
};
