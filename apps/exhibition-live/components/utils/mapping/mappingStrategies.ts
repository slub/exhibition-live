import { JsonSchema } from "@jsonforms/core";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { getPaddedDate } from "../core/specialDate";
import { mapByConfig } from "./mapByConfig";
import isNil from "lodash/isNil";
import { findEntityWithinLobidByIRI } from "../lobid/findEntityWithinLobid";
import { primaryFields, typeIRItoTypeName } from "../../config";
import set from "lodash/set";
import get from "lodash/get";

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
  authorityIRI: string;
  newIRI: (typeIRI: string) => string;
  options?: {
    strictCheckSourceData?: boolean;
    strictCheckTargetData?: boolean;
  };
  mappingTable?: DeclarativeMapping;
};

export type StrategyFunction = (
  sourceData: any,
  targetData: any,
  options?: any,
  context?: StrategyContext,
) => Promise<any> | any;

type ConcatenateStrategy = Strategy & {
  id: "concatenate";
  options?: {
    separator?: string;
  };
};

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

type CreateEntityStrategy = Strategy & {
  id: "createEntity";
  options?: {
    typeIRI?: string;
    typeName?: string;
    subFieldMapping: {
      fromSelf?: DeclarativeMappings;
      fromEntity?: DeclarativeMappings;
    };
  };
};
export const createEntity = async (
  sourceData: any,
  _targetData: any,
  options?: CreateEntityStrategy["options"],
  context?: StrategyContext,
): Promise<any> => {
  if (!context) throw new Error("No context provided");
  const { typeIRI, subFieldMapping } = options || {};
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
  return isArray ? newDataElements : newDataElements[0];
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
  return dayJsDateToSpecialInt(
    dayjs(extractElement === "start" ? start : end, "DD.MM.YYYY"),
  );
};

type AnyStrategy =
  | ConcatenateStrategy
  | TakeFirstStrategy
  | AppendStrategy
  | CreateEntityStrategy
  | DateRangeStringToSpecialInt
  | DateStringToSpecialInt
  | ExistsStrategy
  | ConstantStrategy;

type SourceElement = {
  path: string;
  expectedSchema?: JsonSchema;
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

export type DeclarativeMappings = DeclarativeSimpleMapping[];

export type DeclarativeMapping = { [key: string]: DeclarativeMappings };
export const strategyFunctionMap: { [strategyId: string]: StrategyFunction } = {
  concatenate,
  takeFirst,
  append,
  createEntity,
  dateStringToSpecialInt,
  dateRangeStringToSpecialInt,
  exists: existsStrategy,
  constant: constantStrategy,
};
