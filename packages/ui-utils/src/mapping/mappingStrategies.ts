import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { mapByConfig } from "./mapByConfig";
import isNil from "lodash-es/isNil";
import { findEntityWithinLobidByIRI } from "../lobid";
import set from "lodash-es/set";
import get from "lodash-es/get";
import { getPaddedDate } from "@slub/edb-core-utils";
import { IRIToStringFn, PrimaryFieldDeclaration } from "@slub/edb-core-types";
import { JSONSchema7 } from "json-schema";

dayjs.extend(customParseFormat);

interface Strategy {
  id: string;
}

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
  authorityIRI: string;
  newIRI: (typeIRI: string) => string;
  options?: {
    strictCheckSourceData?: boolean;
    strictCheckTargetData?: boolean;
  };
  mappingTable?: DeclarativeMapping;
  primaryFields: PrimaryFieldDeclaration;
  typeIRItoTypeName: IRIToStringFn;
  declarativeMappings: DeclarativeMapping;
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
  const { typeIRI, mainProperty, authorityFields } = options || {};
  if (!Array.isArray(sourceData))
    throw new Error("Source data is not an array");

  const amount = authorityFields.length + 1;
  if (sourceData.length % amount !== 0)
    console.warn(
      `Source data length ${sourceData.length} is not a multiple of ${amount}`,
    );
  /*
    throw new Error(
      `Source data length ${sourceData.length} is not a multiple of ${amount}`,
    );*/
  const groupedSourceData = [];
  for (let i = 0; i < sourceData.length; i += amount) {
    groupedSourceData.push(sourceData.slice(i, i + amount));
  }

  const {
    searchEntityByLabel,
    getPrimaryIRIBySecondaryIRI,
    authorityIRI,
    newIRI,
    primaryFields,
    typeIRItoTypeName,
    declarativeMappings,
  } = context;
  const sourceDataArray = sourceData;
  const newDataElements = [];
  for (const sourceDataGroupElement of groupedSourceData) {
    const sourceDataElement = sourceDataGroupElement[0];
    if (authorityFields.length > 1) {
      console.warn(
        "only one authority field is supported at the moment. Will use the first one.",
      );
    }
    const authorityOptions = authorityFields[0];
    const authIRI = authorityOptions.authorityIRI || authorityIRI;
    const authLinkPrefix = authorityOptions.authorityLinkPrefix || "";
    const sourceDataAuthority = sourceDataGroupElement[1];
    const secondaryIRI =
      typeof sourceDataAuthority === "string" &&
      sourceDataAuthority.trim().length > 0
        ? `${authLinkPrefix}${sourceDataAuthority}`
        : null;
    const sourceDataLabel = sourceDataElement?.trim();

    let primaryIRI: string | null = null;
    if (secondaryIRI) {
      console.log(`will look for ${secondaryIRI} within own database`);
      primaryIRI = await getPrimaryIRIBySecondaryIRI(
        secondaryIRI,
        authIRI,
        typeIRI,
      );
      if (primaryIRI) {
        console.log(
          `found ${secondaryIRI} as ${primaryIRI} within own database`,
        );
      }
    } else if (sourceDataLabel) {
      primaryIRI = await searchEntityByLabel(sourceDataLabel, typeIRI);
    }

    const typeName = typeIRItoTypeName(typeIRI);
    const primaryField = primaryFields[typeName];
    const labelField = primaryField?.label || "label";
    let targetData: any = {};
    if (!primaryIRI && secondaryIRI) {
      console.log("not yet implemented look form id within external database");
      //TODO: we will hardcode lobid search here but this should be taken out of the context and linked with properties from options
      const lobidData = await findEntityWithinLobidByIRI(secondaryIRI);
      if (lobidData) {
        const mappingConfig = declarativeMappings[typeName];
        if (!mappingConfig) {
          console.warn(`no mapping config for ${typeName}`);
        } else {
          try {
            const dataFromGND = await mapByConfig(
              lobidData,
              {},
              mappingConfig,
              context,
            );
            const inject = {
              "@id": newIRI(typeIRI || ""),
              "@type": typeIRI,
              lastNormUpdate: new Date().toISOString(),
            };
            targetData = { ...dataFromGND, ...inject };
          } catch (e) {
            console.error(e);
          }
        }
        if (!targetData) {
          targetData = {
            "@id": newIRI(typeIRI || ""),
            "@type": typeIRI,
            [labelField]: sourceDataLabel,
            __draft: true,
          };
        }
        newDataElements.push(targetData);
      } else {
        newDataElements.push({
          "@id": primaryIRI,
        });
      }
    }
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
  const { newIRI } = context;
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
        typeof mainProperty.offset === "number"
          ? sourceDataElements[mainProperty.offset]
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
  return newDataElements.map((newData) => ({
    "@id": newIRI(typeIRI || ""),
    "@type": typeIRI,
    __draft: true,
    ...newData,
  }));
};

type CreateEntityFromStringStrategy = Strategy & {
  id: "createEntityFromString";
  options?: {
    typeIRI?: string;
    typeName?: string;
  };
};

type CreateEntityStrategy = Strategy & {
  id: "createEntity";
  options?: {
    typeIRI?: string;
    typeName?: string;
    single?: boolean;
    subFieldMapping: {
      fromSelf?: DeclarativeMappings;
      fromEntity?: DeclarativeMappings;
    };
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
  const { searchEntityByLabel, newIRI, typeIRItoTypeName, primaryFields } =
    context;
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
      newDataElements.push(targetData);
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
  const { getPrimaryIRIBySecondaryIRI, newIRI, authorityIRI } = context;
  const newDataElements = [];
  for (const sourceDataElement of sourceDataArray) {
    const authorityEntryIRI = sourceDataElement.id;
    const primaryIRI = await getPrimaryIRIBySecondaryIRI(
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
      if (options?.typeName && context.mappingTable?.[options.typeName]) {
        const mapping = context.mappingTable[options.typeName];
        const fullData = await findEntityWithinLobidByIRI(sourceDataElement.id);
        if (fullData) {
          const mappedData = await mapByConfig(
            fullData,
            targetData,
            mapping,
            context,
          );
          newDataElements.push(mappedData);
        }
      } else if (subFieldMapping) {
        newDataElements.push(
          await mapByConfig(
            sourceDataElement,
            targetData,
            subFieldMapping.fromEntity || [],
            context,
          ),
        );
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

export type AnyStrategy =
  | ConcatenateStrategy
  | TakeFirstStrategy
  | AppendStrategy
  | CreateEntityStrategy
  | CreateEntityFromStringStrategy
  | CreateEntityWithReificationFromString
  | DateRangeStringToSpecialInt
  | DateStringToSpecialInt
  | ExistsStrategy
  | ConstantStrategy
  | SplitStrategy;

export type AnyFlatStrategy =
  | ConcatenateStrategy
  | TakeFirstStrategy
  | ExistsStrategy
  | CreateEntityFromStringStrategy
  | CreateEntityWithReificationFromString
  | CreateEntityWithAuthoritativeLink
  | DateArrayToSpecialInt
  | SplitStrategy;

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
};
