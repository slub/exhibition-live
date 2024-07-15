import {
  IRIToStringFn,
  PrimaryFieldDeclaration,
  QueryBuilderOptions,
} from "@slub/edb-core-types";
import {
  findEntityByAuthorityIRI,
  searchEntityByLabel,
} from "@slub/sparql-schema";
import { findEntityWithinLobidByIRI } from "@slub/edb-authorities";
import { DeclarativeMapping, StrategyContext } from "@slub/edb-data-mapping";

/**
 * the strategy context is a collection of functions and values that are used by the mapping strategies.
 * To facilitate the creation of the context, this function is provided.
 *
 * @param doQuery
 * @param queryBuilderOptions
 * @param defaultPrefix
 * @param createEntityIRI
 * @param typeIRItoTypeName
 * @param primaryFields
 * @param declarativeMappings
 */
export const makeDefaultMappingStrategyContext: (
  doQuery: (query: string) => Promise<any>,
  queryBuilderOptions: QueryBuilderOptions,
  defaultPrefix: string,
  createEntityIRI: (typeIRI: string) => string,
  typeIRIToTypeName: IRIToStringFn,
  primaryFields: PrimaryFieldDeclaration,
  declarativeMappings?: DeclarativeMapping,
) => StrategyContext = (
  doQuery,
  queryBuilderOptions,
  defaultPrefix,
  createEntityIRI,
  typeIRItoTypeName,
  primaryFields,
  declarativeMappings,
) => ({
  getPrimaryIRIBySecondaryIRI: async (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI?: string | undefined,
  ) => {
    // @ts-ignore
    const ids = await findEntityByAuthorityIRI(
      secondaryIRI,
      typeIRI,
      doQuery,
      undefined,
      { prefixes: queryBuilderOptions.prefixes, defaultPrefix },
    );
    if (ids.length > 0) {
      console.warn("found more then one entity");
    }
    return ids[0] || null;
  },
  searchEntityByLabel: async (
    label: string,
    typeIRI: string,
  ): Promise<string> => {
    // @ts-ignore
    const ids = await searchEntityByLabel(label, typeIRI, doQuery, undefined, {
      prefixes: queryBuilderOptions.prefixes,
      defaultPrefix,
      typeIRItoTypeName,
      primaryFields,
    });
    if (ids.length > 0) {
      console.warn("found more then one entity");
    }
    return ids[0] || null;
  },
  authorityAccess: {
    "http://d-nb.info/gnd": {
      authorityIRI: "http://d-nb.info/gnd",
      getEntityByIRI: findEntityWithinLobidByIRI,
    },
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: createEntityIRI,
  typeIRItoTypeName: typeIRItoTypeName,
  primaryFields: primaryFields,
  declarativeMappings,
});
