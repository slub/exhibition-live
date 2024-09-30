import { Dataset, DatasetCore } from "@rdfjs/types";
import { JSONSchema7 } from "json-schema";
import { bringDefinitionToTop, defs } from "@slub/json-schema-utils";
import { rdf } from "@tpluscode/rdf-ns-builders";
import df from "@rdfjs/data-model";
import {
  traverseGraphExtractBySchema,
  WalkerOptions,
} from "@slub/edb-graph-traversal";
import { IRIToStringFn, SPARQLCRUDOptions } from "@slub/edb-core-types";
import type { JsonLdContext } from "jsonld-context-parser";

export type DSProcessingOptions = SPARQLCRUDOptions & {
  walkerOptions?: Partial<WalkerOptions>;
  jsonldContext?: JsonLdContext;
  typeNameToTypeIRI: IRIToStringFn;
};
export const processAllDocumentsFromDataset = async (
  ds: DatasetCore,
  rootSchema: JSONSchema7,
  onDocument: (
    entityIRI: string,
    typeIRI: string,
    document: any,
  ) => Promise<void>,
  options: DSProcessingOptions,
) => {
  const { walkerOptions, typeNameToTypeIRI } = options;
  const typeNames = Object.keys(defs(rootSchema));
  const subjects: Set<string> = new Set();
  for (const typeName of typeNames) {
    const typeIRI = typeNameToTypeIRI(typeName);
    const quads = ds.match(null, rdf.type, df.namedNode(typeIRI));
    for (const q of quads) {
      const entityIRI = q.subject.value;
      if (subjects.has(entityIRI)) continue; // skip
      subjects.add(q.subject.value);
      const schema = bringDefinitionToTop(rootSchema, typeName);
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
