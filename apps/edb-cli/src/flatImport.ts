import {
  IRIToStringFn,
  Prefixes,
  PrimaryFieldDeclaration,
  QueryBuilderOptions,
} from "@slub/edb-core-types";
import { DeclarativeMapping, StrategyContext } from "@slub/edb-data-mapping";
import {
  findEntityByAuthorityIRI,
  searchEntityByLabel,
} from "@slub/sparql-schema";
import { findEntityWithinLobidByIRI } from "@slub/edb-authorities";
import { crudFns, typeIRItoTypeName, typeNameToTypeIRI } from "./dataStore";
import config, { slent } from "@slub/exhibition-sparql-config";
import { v4 as uuidv4 } from "uuid";
import { declarativeMappings, primaryFields } from "@slub/exhibition-schema";

export const makeDefaultMappingStrategyContext: (
  doQuery: (query: string) => Promise<any>,
  queryBuilderOptions: QueryBuilderOptions,
  defaultPrefix: string,
  createEntityIRI: (typeIRI: string) => string,
  typeIRIToTypeName: IRIToStringFn,
  primaryFields: PrimaryFieldDeclaration,
  declarativeMappings: DeclarativeMapping,
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
      100,
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

const { defaultPrefix, defaultQueryBuilderOptions } = config;

export const createNewIRI = () => slent(uuidv4()).value;
export const strategyContext = makeDefaultMappingStrategyContext(
  crudFns.selectFetch,
  {
    prefixes: defaultQueryBuilderOptions.prefixes as Prefixes,
    defaultPrefix,
  },
  defaultPrefix,
  createNewIRI,
  typeIRItoTypeName,
  primaryFields,
  declarativeMappings,
);
