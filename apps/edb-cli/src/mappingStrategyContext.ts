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
import { crudFns, typeIRItoTypeName } from "./dataStore";
import config, { slent } from "@slub/exhibition-sparql-config";
import { v4 as uuidv4 } from "uuid";
import { declarativeMappings, primaryFields } from "@slub/exhibition-schema";
import {
  createLogger,
  makeCreateDeeperContextFn,
} from "@slub/edb-data-mapping/src/makeCreateDeeperContextFn";

export const makeMappingStrategyContext: (
  doQuery: (query: string) => Promise<any>,
  queryBuilderOptions: QueryBuilderOptions,
  createEntityIRI: (typeIRI: string) => string,
  typeIRIToTypeName: IRIToStringFn,
  primaryFields: PrimaryFieldDeclaration,
  declarativeMappings: DeclarativeMapping,
  disableLogging?: boolean,
) => StrategyContext = (
  doQuery,
  queryBuilderOptions,
  createEntityIRI,
  typeIRItoTypeName,
  primaryFields,
  declarativeMappings,
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
      100,
      queryBuilderOptions,
    );
    if (ids.length > 1) {
      console.warn(
        `found more than one entity (${ids.length}), will use the first`,
      );
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
    if (ids.length > 1) {
      console.warn(
        `found more than one entity ( ${ids.length} ), will use the first `,
      );
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
  path: [],
  logger: createLogger([], disableLogging),
  createDeeperContext: makeCreateDeeperContextFn(disableLogging),
});

const { defaultPrefix, defaultQueryBuilderOptions } = config;

export const createNewIRI = () => slent(uuidv4()).value;
export const mappingStrategyContext = makeMappingStrategyContext(
  crudFns.selectFetch,
  {
    prefixes: defaultQueryBuilderOptions.prefixes as Prefixes,
    defaultPrefix,
  },
  createNewIRI,
  typeIRItoTypeName,
  primaryFields,
  declarativeMappings,
);
