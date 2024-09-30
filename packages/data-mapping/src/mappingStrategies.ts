import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { mapByConfig } from "./mapByConfig";
import isNil from "lodash-es/isNil";
import set from "lodash-es/set";
import get from "lodash-es/get";
import { getPaddedDate, makeSpecialDate } from "@slub/edb-core-utils";
import {
  IRIToStringFn,
  NormDataMappings,
  PrimaryFieldDeclaration,
} from "@slub/edb-core-types";
import { JSONSchema7 } from "json-schema";
import { isNaN } from "lodash-es";

dayjs.extend(customParseFormat);

interface Strategy {
  id: string;
}

export type AuthorityConfiguration = {
  authorityIRI: string;
  getEntityByIRI: (iri: string) => Promise<any>;
};

export type Logger = {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export type CreateDeeperContextFn = (
  strategy: StrategyContext,
  pathElement: string,
  currentMapping?: DeclarativeMappings | DeclarativeFlatMappings,
) => StrategyContext;

export type StrategyContext = {
  getPrimaryIRIBySecondaryIRI: (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI?: string,
  ) => Promise<string | null>;
  searchEntityByLabel: (
    label: string,
    typeIRI: string,
  ) => Promise<string | null>;
  authorityAccess?: Record<string, AuthorityConfiguration>;
  authorityIRI: string;
  newIRI: (typeIRI: string) => string;
  onNewDocument?: (document: any) => Promise<any>;
  options?: {
    strictCheckSourceData?: boolean;
    strictCheckTargetData?: boolean;
  };
  mappingTable?: DeclarativeMapping;
  currentMapping?: DeclarativeMappings;
  primaryFields: PrimaryFieldDeclaration;
  typeIRItoTypeName: IRIToStringFn;
  normDataMappings: NormDataMappings;
  path: string[];
  logger: Logger;
  createDeeperContext: CreateDeeperContextFn;
};

export type StrategyFunction = (
  sourceData: any,
  targetData: any,
  options?: any,
  context?: StrategyContext,
) => Promise<any> | any;

export type ConcatenateStrategy = Strategy & {
  id: "concatenate";
  options?: {
    separator?: string;
  };
};

/**
 * Concatenates an array of strings into a single string
 * @param sourceData array of strings
 * @param _targetData not used
 * @param options options for the concatenation
 *    - separator: the separator to use between the strings
 * @returns the concatenated string
 */
export const concatenate = (
  sourceData: any[],
  _targetData: string,
  options?: ConcatenateStrategy["options"],
): string => {
  const separator = options?.separator || "";
  return sourceData.join(separator);
};

type TakeFirstStrategy = Strategy & {
  id: "takeFirst";
};

/**
 * Takes the first element of an array
 * @param sourceData array of elements
 * @param _targetData not used
 */
export const takeFirst = (sourceData: any[], _targetData: any): any =>
  sourceData[0];

type WithDotTemplateStrategy = Strategy & {
  id: "withDotTemplate";
  options?: {
    single?: boolean;
    template: string;
  };
};

export const withDotTemplate = (
  sourceData: any | any[],
  _targetData: any,
  options?: WithDotTemplateStrategy["options"],
): any => {
  const sourceD = Array.isArray(sourceData) ? sourceData : [sourceData];
  const { template } = options || {};
  let result = [];
  for (const s of sourceD) {
    result.push(template.replace("{{value}}", s));
    if (options?.single) return result[0];
  }
  return result;
};

type AppendStrategy = Strategy & {
  id: "append";
  options?: {
    allowDuplicates?: boolean;
    subFieldMapping?: {
      fromSelf?: DeclarativeMappings;
    };
  };
};

/**
 * Appends an array of values to another array
 * @param values array of values to append
 * @param targetData array to append to
 * @param options options for the append
 */
export const append = (
  values: any[],
  targetData: any[],
  options?: AppendStrategy["options"],
): any[] => {
  const { allowDuplicates } = options || {};
  const all = [...(targetData || []), ...values];
  if (allowDuplicates) return all;
  // @ts-ignore
  return [...new Set(all).values()];
};

type StatementProperty = {
  property: string;
  offset: number;
  mapping?: {
    strategy: AnyStrategy;
  };
};

type AuthorityFieldInformation = {
  offset: number;
  authorityIRI?: string;
  authorityLinkPrefix?: string;
};

type CreateEntityWithAuthoritativeLink = Strategy & {
  id: "createEntityWithAuthoritativeLink";
  options?: {
    single?: boolean;
    typeIRI?: string;
    typeName?: string;
    mainProperty: {
      offset?: number;
    };
    authorityFields: AuthorityFieldInformation[];
  };
};

/**
 * Creates an entity with an authoritative link
 * @param sourceData array of source data
 * @param _targetData not used
 * @param options options for the creation
 * @param context the context for the strategy
 * @returns the created entity
 */
export const createEntityWithAuthoritativeLink = async (
  sourceData: any,
  _targetData: any,
  options?: CreateEntityWithAuthoritativeLink["options"],
  context?: StrategyContext,
): Promise<any> => {
  if (!context) throw new Error("No context provided");
  const {
    searchEntityByLabel,
    getPrimaryIRIBySecondaryIRI,
    authorityIRI,
    newIRI,
    primaryFields,
    typeIRItoTypeName,
    normDataMappings,
    authorityAccess,
    createDeeperContext,
    logger,
    onNewDocument,
  } = context;
  const { typeIRI, mainProperty, authorityFields, single } = options || {};
  if (!Array.isArray(sourceData))
    throw new Error("Source data is not an array");

  const amount = authorityFields.length + 1;
  if (sourceData.length % amount !== 0)
    logger.warn(
      `Source data length ${sourceData.length} is not a multiple of ${amount}`,
    );
  const groupedSourceData = [];
  for (let i = 0; i < sourceData.length; i += amount) {
    groupedSourceData.push(sourceData.slice(i, i + amount));
  }

  const newDataElements = [];
  for (const sourceDataGroupElement of groupedSourceData) {
    const sourceDataElement = sourceDataGroupElement[0];
    if (authorityFields.length > 1) {
      logger.warn(
        "only one authority field is supported at the moment. Will use the first one.",
      );
    }
    const authorityOptions = authorityFields[0];
    const authIRI = authorityOptions.authorityIRI || authorityIRI;
    const authLinkPrefix = authorityOptions.authorityLinkPrefix || "";
    const authAccess = authorityAccess?.[authIRI];
    const sourceDataAuthority = sourceDataGroupElement[authorityOptions.offset];
    const typeName = typeIRItoTypeName(typeIRI);
    let secondaryIRI =
      typeof sourceDataAuthority === "string" &&
      sourceDataAuthority.trim().length > 0
        ? `${authLinkPrefix}${sourceDataAuthority}`
        : null;
    const sourceDataLabel = sourceDataElement?.trim();

    let primaryIRI: string | null = null;
    if (secondaryIRI) {
      logger.log(`will look for ${secondaryIRI} within own database`);
      primaryIRI = await getPrimaryIRIBySecondaryIRI(
        secondaryIRI,
        authIRI,
        typeIRI,
      );
    } else if (sourceDataLabel) {
      logger.log(
        `will look for "${sourceDataLabel}" type ${typeName} within own database by label`,
      );
      primaryIRI = await searchEntityByLabel(sourceDataLabel, typeIRI);
    }

    if (primaryIRI) {
      logger.log(`found ${secondaryIRI} as ${primaryIRI} within own database`);
      newDataElements.push({
        "@id": primaryIRI,
      });
      continue;
    }

    const primaryField = primaryFields[typeName];
    const labelField = primaryField?.label || "label";
    let targetData: any = {};
    if (secondaryIRI && authAccess) {
      logger.log(
        `will look for ${secondaryIRI} of type ${typeName} within external database`,
      );

      let normData = null;
      try {
        normData = await authAccess.getEntityByIRI(secondaryIRI);
      } catch (e) {
        logger.error(
          `error while fetching ${secondaryIRI} from external database - maybe the entry does not exist? \n ${e}`,
        );
      }
      if (!normData) {
        logger.warn(`no data found for ${secondaryIRI}`);
        continue;
      }

      let mappingConfig = normDataMappings?.[authIRI]?.mapping?.[typeName];
      let authorityIRI = authIRI;

      //JUst a quick and dirty hack to use wikidata instead of the default authority
      if (Array.isArray(normData?.sameAs)) {
        const wikidataEntry = normData.sameAs.find(({ id }: { id: string }) =>
          id.startsWith("http://www.wikidata.org/entity/"),
        );
        const wikidataMappingConfig =
          normDataMappings?.["http://www.wikidata.org"]?.mapping?.[typeName];
        if (wikidataEntry && wikidataMappingConfig) {
          const wikidataIRI = wikidataEntry.id;
          const wdAuthAccess = authorityAccess?.["http://www.wikidata.org"];
          if (wdAuthAccess) {
            try {
              normData = await wdAuthAccess.getEntityByIRI(wikidataIRI);
              mappingConfig = wikidataMappingConfig;
              authorityIRI = "http://www.wikidata.org";
              logger.log(
                `found wikidata entry for ${secondaryIRI} at ${wikidataIRI}, will map this entry`,
              );
              secondaryIRI = wikidataIRI;

              primaryIRI = await getPrimaryIRIBySecondaryIRI(
                secondaryIRI,
                authorityIRI,
                typeIRI,
              );
            } catch (e) {
              logger.error(
                `error while fetching ${wikidataIRI} from external database - maybe the entry does not exist? \n ${e}`,
              );
            }
          }
        }
      }
      if ((!mappingConfig || !normData) && !primaryIRI) {
        logger.warn(
          `no mapping config for ${typeName} or no normData in ${authIRI}, cannot convert to local data model`,
        );
      } else if (primaryIRI) {
        logger.log(
          `found ${secondaryIRI} as ${primaryIRI} within internal database`,
        );
        newDataElements.push({
          "@id": primaryIRI,
        });
        continue;
      } else {
        logger.log("mapping authority entry to local data model");
        try {
          const data = await mapByConfig(
            normData,
            {},
            mappingConfig,
            createDeeperContext(
              {
                ...context,
                authorityIRI,
              },
              `createEntityWithAuthoritativeLink_${typeName}`,
              mappingConfig,
            ),
          );
          const inject = {
            "@id": newIRI(typeIRI || ""),
            "@type": typeIRI,
            lastNormUpdate: new Date().toISOString(),
            idAuthority: {
              authority: authorityIRI,
              id: secondaryIRI,
            },
          };
          targetData = { ...data, ...inject };
        } catch (e) {
          logger.error(
            `error mapping authority entry to local data model \n ${e}`,
          );
        }
      }
      if (!targetData) {
        logger.log(
          `no data found for ${secondaryIRI}, will create a new entity of type ${typeIRI} with label ${sourceDataLabel}`,
        );
        targetData = {
          "@id": newIRI(typeIRI || ""),
          "@type": typeIRI,
          [labelField]: sourceDataLabel,
          __draft: true,
        };
      }

      const newEntity = onNewDocument
        ? await onNewDocument(targetData)
        : targetData;

      newDataElements.push(newEntity);
    }

    if (single) return newDataElements[0];
  }
  return newDataElements;
};

type CreateEntityWithReificationFromString = Strategy & {
  id: "createEntityWithReificationFromString";
  options?: {
    typeIRI?: string;
    typeName?: string;
    mainProperty: {
      property: string;
      offset?: number;
      mapping?: {
        strategy: AnyStrategy;
      };
    };
    statementProperties: StatementProperty[];
  };
};

export const createEntityWithReificationFromString = async (
  sourceData: any,
  _targetData: any,
  options?: CreateEntityWithReificationFromString["options"],
  context?: StrategyContext,
): Promise<any> => {
  if (!context) throw new Error("No context provided");
  const { typeIRI, mainProperty, statementProperties } = options || {};
  const { newIRI, onNewDocument } = context;
  if (!Array.isArray(sourceData))
    throw new Error("Source data is not an array");
  const newDataElements = [];
  const amount = statementProperties.length + 1;
  if (sourceData.length % amount !== 0)
    throw new Error(
      `Source data length ${sourceData.length} is not a multiple of ${amount}`,
    );
  //group source data by amount
  const groupedSourceData = [];
  for (let i = 0; i < sourceData.length; i += amount) {
    groupedSourceData.push(sourceData.slice(i, i + amount));
  }

  for (const sourceDataElements of groupedSourceData) {
    const newData = {};

    const mainSourceDataElement =
      typeof mainProperty.offset === "number"
        ? sourceDataElements[mainProperty.offset]
        : sourceDataElements;
    if (
      typeof mainSourceDataElement !== "string" ||
      mainSourceDataElement.length === 0
    ) {
      continue;
    }
    const trimmedMainSourceDataElement = mainSourceDataElement.trim();
    const mainPropertyStrategy = mainProperty.mapping?.strategy;
    if (!mainPropertyStrategy) {
      set(newData, mainProperty.property, trimmedMainSourceDataElement);
    } else {
      const mappingFunction = strategyFunctionMap[mainPropertyStrategy.id];
      if (typeof mappingFunction !== "function") {
        throw new Error(
          `Strategy ${mainPropertyStrategy.id} is not implemented`,
        );
      }
      const strategyOptions = (mainPropertyStrategy as any).options;
      const value = await mappingFunction(
        trimmedMainSourceDataElement,
        get(newData, mainProperty.property),
        strategyOptions,
        context,
      );
      if (!isNil(value)) set(newData, mainProperty.property, value);
    }

    for (const statementProperty of statementProperties) {
      const sourceDataElement =
        typeof statementProperty.offset === "number"
          ? sourceDataElements[statementProperty.offset]
          : sourceDataElements;
      if (
        typeof sourceDataElement !== "string" ||
        sourceDataElement.length === 0
      ) {
        continue;
      }
      const trimmedSourceDataElement = sourceDataElement.trim();
      const strategy = statementProperty.mapping?.strategy;
      if (!strategy) {
        set(newData, statementProperty.property, trimmedSourceDataElement);
      } else {
        const mappingFunction = strategyFunctionMap[strategy.id];
        if (typeof mappingFunction !== "function") {
          throw new Error(`Strategy ${strategy.id} is not implemented`);
        }
        const strategyOptions = (strategy as any).options;
        const value = await mappingFunction(
          trimmedSourceDataElement,
          get(newData, statementProperty.property),
          strategyOptions,
          context,
        );
        if (!isNil(value)) set(newData, statementProperty.property, value);
      }
    }
    newDataElements.push(newData);
  }
  return await Promise.all(
    newDataElements.map(async (newData) => {
      const newEntity = {
        "@id": newIRI(typeIRI || ""),
        "@type": typeIRI,
        __draft: true,
        ...newData,
      };
      return onNewDocument ? await onNewDocument(newEntity) : newEntity;
    }),
  );
};

type CreateEntityFromStringStrategy = Strategy & {
  id: "createEntityFromString";
  options?: {
    typeIRI?: string;
    typeName?: string;
  };
};

export type MappingID = string;

export type FromEntity = DeclarativeMappings | MappingID | "self";

export type SubFieldMappingConnection = {
  fromSelf?: DeclarativeMappings;
  fromEntity?: FromEntity;
};

export type CreateEntityStrategy = Strategy & {
  id: "createEntity";
  options?: {
    typeIRI?: string;
    typeName?: string;
    single?: boolean;
    subFieldMapping: SubFieldMappingConnection;
  };
};

export const createEntityFromString = async (
  sourceData: any,
  _targetData: any,
  options?: CreateEntityFromStringStrategy["options"],
  context?: StrategyContext,
): Promise<any> => {
  if (!context) throw new Error("No context provided");
  const { typeIRI } = options || {};
  const {
    searchEntityByLabel,
    newIRI,
    typeIRItoTypeName,
    primaryFields,
    onNewDocument,
  } = context;
  const isArray = Array.isArray(sourceData);
  const sourceDataArray = isArray ? sourceData : [sourceData];
  const newDataElements = [];
  for (const sourceDataElement of sourceDataArray) {
    if (
      typeof sourceDataElement !== "string" ||
      sourceDataElement.length === 0
    ) {
      continue;
    }
    const trimmedSourceDataElement = sourceDataElement.trim();
    const primaryIRI = await searchEntityByLabel(
      trimmedSourceDataElement,
      typeIRI,
    );
    const typeName = typeIRItoTypeName(typeIRI);
    const primaryField = primaryFields[typeName];
    const labelField = primaryField?.label || "label";
    if (!primaryIRI) {
      const targetData = {
        "@id": newIRI(typeIRI || ""),
        "@type": typeIRI,
        [labelField]: trimmedSourceDataElement,
        __draft: true,
      };
      newDataElements.push(
        onNewDocument ? await onNewDocument(targetData) : targetData,
      );
    } else {
      newDataElements.push({
        "@id": primaryIRI,
      });
    }
  }
  return isArray ? newDataElements : newDataElements[0];
};

export const createEntity = async (
  sourceData: any,
  _targetData: any,
  options?: CreateEntityStrategy["options"],
  context?: StrategyContext,
): Promise<any> => {
  if (!context) throw new Error("No context provided");
  const { typeIRI, subFieldMapping, single } = options || {};
  const isArray = Array.isArray(sourceData);
  const sourceDataArray = isArray ? sourceData : [sourceData];
  const {
    getPrimaryIRIBySecondaryIRI,
    newIRI,
    logger,
    createDeeperContext,
    onNewDocument,
    normDataMappings,
    authorityAccess,
  } = context;
  let authorityIRI = context.authorityIRI;
  const authAccess = authorityAccess?.[authorityIRI];
  const mappingTable = normDataMappings?.[authorityIRI]?.mapping;
  const newDataElements = [];

  for (const sourceDataElement of sourceDataArray) {
    const authorityEntryIRI = sourceDataElement.id;
    let primaryIRI = await getPrimaryIRIBySecondaryIRI(
      authorityEntryIRI,
      authorityIRI,
      typeIRI,
    );
    if (!primaryIRI) {
      const targetData = {
        "@id": newIRI(typeIRI || ""),
        "@type": typeIRI,
        __draft: true,
      };
      let secondaryIRI = authorityEntryIRI;

      const typeName: string | undefined = options?.typeName;
      if (typeName && mappingTable?.[typeName] && authAccess) {
        let mappingConfig = mappingTable[typeName];
        let normData = await authAccess.getEntityByIRI(secondaryIRI);
        //Just a quick and dirty hack to use wikidata instead of the default authority
        if (Array.isArray(normData?.sameAs)) {
          const wikidataEntry = normData.sameAs.find(({ id }: { id: string }) =>
            id.startsWith("http://www.wikidata.org/entity/"),
          );
          const wikidataMappingConfig =
            normDataMappings?.["http://www.wikidata.org"]?.mapping?.[typeName];
          if (wikidataEntry && wikidataMappingConfig) {
            const wikidataIRI = wikidataEntry.id;
            const wdAuthAccess = authorityAccess?.["http://www.wikidata.org"];
            if (wdAuthAccess) {
              try {
                normData = await wdAuthAccess.getEntityByIRI(wikidataIRI);
                mappingConfig = wikidataMappingConfig;
                authorityIRI = "http://www.wikidata.org";
                logger.log(
                  `found wikidata entry for ${secondaryIRI} at ${wikidataIRI}, will map this entry`,
                );
                secondaryIRI = wikidataIRI;
                primaryIRI = await getPrimaryIRIBySecondaryIRI(
                  secondaryIRI,
                  authorityIRI,
                  typeIRI,
                );
              } catch (e) {
                logger.error(
                  `error while fetching ${wikidataIRI} from external database - maybe the entry does not exist? \n ${e}`,
                );
              }
            }
          }
        }

        if (normData && !primaryIRI) {
          logger.log(
            `mapping authority entry (${secondaryIRI}) to local data model of type ${typeName} (${authorityIRI})`,
          );
          const mappedData = await mapByConfig(
            normData,
            targetData,
            mappingConfig,
            createDeeperContext(
              {
                ...context,
                authorityIRI,
              },
              `createEntity_${typeName}`,
              mappingConfig,
            ),
          );

          const result = onNewDocument
            ? await onNewDocument(mappedData)
            : mappedData;
          if (!isArray || single) {
            return result;
          }
          newDataElements.push(result);
        } else if (primaryIRI) {
          logger.log(
            `found ${secondaryIRI} as ${primaryIRI} within internal database`,
          );
          newDataElements.push({
            "@id": primaryIRI,
          });
        }
      } else if (subFieldMapping) {
        logger.log(
          `mapping authority entry (${sourceDataElement.id}) to local data model of type ${typeName} with the given subfield mapping`,
        );
        let subFieldMappingDeclaration = subFieldMapping.fromEntity;
        if (subFieldMapping.fromEntity === "self") {
          subFieldMappingDeclaration = context.currentMapping;
        } else if (typeof subFieldMapping.fromEntity === "string") {
          subFieldMappingDeclaration =
            context.mappingTable?.[subFieldMapping.fromEntity];
        }

        if (!Array.isArray(subFieldMappingDeclaration)) {
          logger.error(
            "subFieldMappingDeclaration is not an array, either the mapping id does not exist or the mapping is not an array",
          );
        } else {
          const newEntity = await mapByConfig(
            sourceDataElement,
            targetData,
            subFieldMappingDeclaration,
            createDeeperContext(
              context,
              `createEntity_${typeName}`,
              subFieldMappingDeclaration,
            ),
          );
          const result = onNewDocument
            ? await onNewDocument(newEntity)
            : newEntity;
          if (!isArray || single) {
            return result;
          }
          newDataElements.push(result);
        }
      }
    } else {
      newDataElements.push({
        "@id": primaryIRI,
      });
    }
  }

  return isArray && !single ? newDataElements : newDataElements[0];
};

type ConstantStrategy = Strategy & {
  id: "constant";
  options?: {
    value: string | number;
  };
};

const constantStrategy = (
  _source: any,
  _target: any,
  options?: ConstantStrategy["options"],
): string | number => {
  const { value } = options || {};
  return value;
};

type DateStringToSpecialInt = Strategy & {
  id: "dateStringToSpecialInt";
};

type DateArrayToSpecialInt = Strategy & {
  id: "dateArrayToSpecialInt";
};

const stringToInt = (input: string | number): number | null => {
  if (typeof input === "number") return input;
  const num = Number(input);
  if (isNaN(num)) return null;
  return num;
};
const dateArrayToSpecialInt = (
  sourceData: (string | number)[],
  _targetData: any,
): number | null => {
  if (sourceData.length < 0) return null;
  const date = dayjs();
  const day = stringToInt(sourceData[0]);
  const month = stringToInt(sourceData[1]);
  const year = stringToInt(sourceData[2]);
  if (!year) return null;
  date.year(year);
  if (month) date.month(month - 1);
  if (day) date.date(day);
  return dayJsDateToSpecialInt(date);
};

const dayJsDateToSpecialInt = (
  date: dayjs.Dayjs,
  yearOnly?: boolean,
): number | null => {
  if (date.isValid()) {
    if (yearOnly) return Number(`${date.format("YYYY")}0000`);
    const paddedDateString = getPaddedDate(date.toDate());
    return Number(paddedDateString);
  }
  return null;
};
export const dateStringToSpecialInt = (
  sourceData: string | string[],
  _targetData: any,
): number | null => {
  const data = Array.isArray(sourceData) ? sourceData[0] : sourceData;
  if (!data) return null;
  const yearOnly = data.length === 4;
  const separator = data.includes("-") ? "-" : ".";
  const en = data.includes("-");
  const formatString = yearOnly
    ? "YYYY"
    : (en ? ["YYYY", "MM", "DD"] : ["DD", "MM", "YYYY"]).join(separator);
  return dayJsDateToSpecialInt(dayjs(data, formatString), yearOnly);
};

type SplitStrategy = Strategy & {
  id: "split";
  options?: {
    separator?: string;
    mapping?: {
      strategy: AnyStrategy;
    };
  };
};

const splitStrategy = async (
  sourceData: any,
  _targetData: any,
  options?: SplitStrategy["options"],
  context?: StrategyContext,
): Promise<any[]> => {
  const { separator, mapping } = options || {};
  const mappingFunction = strategyFunctionMap[mapping?.strategy.id];
  if (typeof mappingFunction !== "function") {
    throw new Error(`Strategy ${mapping?.strategy.id} is not implemented`);
  }
  const strategyOptions = (mapping?.strategy as any)?.options;
  const values = sourceData.split(separator);
  return Promise.all(
    values.map(
      async (value) =>
        await mappingFunction(value, null, strategyOptions, context),
    ),
  );
};

type ExistsStrategy = Strategy & {
  id: "exists";
};
const existsStrategy = (sourceData: any, _targetData: any): boolean => {
  return !isNil(sourceData);
};

type DateRangeStringToSpecialInt = Strategy & {
  id: "dateRangeStringToSpecialInt";
  options?: {
    extractElement: "start" | "end";
  };
};

export const dateRangeStringToSpecialInt = (
  sourceData: string | string[],
  _targetData: any,
  options?: DateRangeStringToSpecialInt["options"],
): number | null => {
  const { extractElement } = options || {};
  const data = Array.isArray(sourceData) ? sourceData[0] : sourceData;
  if (!data) return null;
  const [start, end] = data.split("-");
  const extractedElement = extractElement === "start" ? start : end;
  if (!extractedElement) return null;
  if (extractedElement.length === 4)
    return dayJsDateToSpecialInt(dayjs(extractedElement, "YYYY"), true);
  return dayJsDateToSpecialInt(
    dayjs(extractElement === "start" ? start : end, "DD.MM.YYYY"),
  );
};

type ArrayToAdbDateStrategy = Strategy & {
  id: "arrayToAdbDate";
  options?: {
    offset?: number;
  };
};

export const arrayToAdbDate = (
  sourceData: any[],
  _targetData: any,
  options?: ArrayToAdbDateStrategy["options"],
  context?: StrategyContext,
): {
  dateValue: number;
  dateModifier: number;
} => {
  const { logger } = context || {};
  const { offset = 0 } = options || {};
  if (sourceData.length < offset + 3)
    throw new Error(
      `Not enough data (${sourceData.length}) to convert to date`,
    );

  const day = Number(sourceData[offset]);
  const month = Number(sourceData[offset + 1] || "0");
  const year = Number(sourceData[offset + 2] || "0");
  const dateValue = makeSpecialDate(
    isNaN(year) ? 0 : year,
    isNaN(month) ? 0 : month,
    isNaN(day) ? 0 : day,
  );
  logger.log(`Converted date ${dateValue} from ${sourceData}`);

  return {
    dateValue: Number(dateValue),
    dateModifier: 0,
  };
};

export type AnyStrategy =
  | ConcatenateStrategy
  | TakeFirstStrategy
  | AppendStrategy
  | CreateEntityStrategy
  | CreateEntityFromStringStrategy
  | CreateEntityWithReificationFromString
  | CreateEntityWithAuthoritativeLink
  | DateRangeStringToSpecialInt
  | DateStringToSpecialInt
  | ExistsStrategy
  | ConstantStrategy
  | SplitStrategy
  | WithDotTemplateStrategy
  | ArrayToAdbDateStrategy;

export type AnyFlatStrategy =
  | ConcatenateStrategy
  | TakeFirstStrategy
  | ExistsStrategy
  | CreateEntityFromStringStrategy
  | CreateEntityWithReificationFromString
  | CreateEntityWithAuthoritativeLink
  | DateArrayToSpecialInt
  | SplitStrategy
  | WithDotTemplateStrategy
  | ArrayToAdbDateStrategy;

type SourceElement = {
  path: string;
  expectedSchema?: JSONSchema7;
};

export type DeclarativeSimpleMapping = {
  source: SourceElement;
  target: {
    path: string;
  };
  mapping?: {
    strategy: AnyStrategy;
  };
};

export type FlatSourceElement = {
  columns: string[] | number[];
  expectedSchema?: JSONSchema7;
};

export type DeclarativeFlatMapping = {
  id: string;
  source: FlatSourceElement;
  target: {
    path: string;
  };
  mapping?: {
    strategy: AnyFlatStrategy;
  };
};

export type DeclarativeMappings = DeclarativeSimpleMapping[];

export type DeclarativeFlatMappings = DeclarativeFlatMapping[];

export type DeclarativeMapping = { [key: string]: DeclarativeMappings };

export type DeclarativeFinalFlatMapping = {
  [key: string]: DeclarativeFlatMappings;
};

export const strategyFunctionMap: { [strategyId: string]: StrategyFunction } = {
  concatenate,
  takeFirst,
  append,
  createEntity,
  createEntityFromString,
  createEntityWithReificationFromString,
  createEntityWithAuthoritativeLink,
  dateStringToSpecialInt,
  dateRangeStringToSpecialInt,
  exists: existsStrategy,
  constant: constantStrategy,
  split: splitStrategy,
  dateArrayToSpecialInt,
  withDotTemplate,
  arrayToAdbDate,
};
