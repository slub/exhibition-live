import { EdbConfRaw, SimplifiedEndpointConfig } from "@slub/edb-global-types";

export const fromSimplifiedEndpointConfig = ({
  baseIRI,
  entityBaseIRI,
  endpoint,
  jsonldContext,
}: SimplifiedEndpointConfig): EdbConfRaw =>
  ({
    BASE_IRI: baseIRI,
    namespaceBase: baseIRI,
    defaultPrefix: baseIRI,
    walkerOptions: {
      maxRecursion: 6,
      maxRecursionEachRef: 6,
      skipAtLevel: 10,
      omitEmptyArrays: true,
      omitEmptyObjects: true,
    },
    defaultJsonldContext: {
      "@vocab": baseIRI,
      ...(jsonldContext || {}),
    },
    defaultQueryBuilderOptions: {
      prefixes: { [""]: baseIRI, entity: entityBaseIRI },
    },
    sparqlEndpoint: endpoint,
  }) as EdbConfRaw;
