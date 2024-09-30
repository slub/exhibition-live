import {
  IRIToStringFn,
  NormDataMapping,
  NormDataMappings,
  PrimaryFieldDeclaration,
  QueryBuilderOptions,
} from "@slub/edb-core-types";
import {
  findEntityByAuthorityIRI,
  searchEntityByLabel,
} from "@slub/sparql-schema";
import { findEntityWithinLobidByIRI } from "@slub/edb-authorities";
import { DeclarativeMapping, StrategyContext } from "@slub/edb-data-mapping";
import {
  createLogger,
  makeCreateDeeperContextFn,
} from "@slub/edb-data-mapping/src/makeCreateDeeperContextFn";
import {
  findEntitiesCommonPropsWithinWikidataByIRI,
  getEntityFromWikidataByIRI,
} from "../wikidata";

/**
 * Creating a context for the mapping requires a lot of boilerplate code. Thus, this function is provided
 * to facilitate the creation of the context.
 *
 * the strategy context is a collection of functions and values that are used by the mapping strategies.
 *
 * @param doQuery the function to query the data store
 * @param queryBuilderOptions prefixes and defaultPrefix for the queryBuilder
 * @param createEntityIRI a function that creates a new IRI for an entity of a given type
 * @param typeIRItoTypeName a function that maps typeIRIs to type names
 * @param primaryFields the primary fields for all types that are used in the mapping
 * @param declarativeMappings the mappings that are used to map norm data to the data store
 * @param disableLogging
 */
export const makeDefaultMappingStrategyContext: (
  doQuery: (query: string) => Promise<any>,
  queryBuilderOptions: QueryBuilderOptions,
  createEntityIRI: (typeIRI: string) => string,
  typeIRIToTypeName: IRIToStringFn,
  primaryFields: PrimaryFieldDeclaration,
  normDataMappings?: NormDataMappings,
  disableLogging?: boolean,
) => StrategyContext = (
  doQuery,
  queryBuilderOptions,
  createEntityIRI,
  typeIRItoTypeName,
  primaryFields,
  normDataMappings,
  disableLogging = false,
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
      queryBuilderOptions,
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
      ...queryBuilderOptions,
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
    "http://www.wikidata.org": {
      authorityIRI: "http://www.wikidata.org",
      getEntityByIRI: async (id) =>
        await getEntityFromWikidataByIRI(id, { rank: "preferred" }),
    },
  },
  authorityIRI: "http://d-nb.info/gnd",
  newIRI: createEntityIRI,
  typeIRItoTypeName: typeIRItoTypeName,
  primaryFields: primaryFields,
  normDataMappings,
  path: [],
  logger: createLogger([], disableLogging),
  createDeeperContext: makeCreateDeeperContextFn(disableLogging),
});
