import { JsonSchema } from "@jsonforms/core";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import get from "lodash/get";

import { getPaddedDate } from "../core/specialDate";
import { mapByConfig } from "./mapByConfig";

dayjs.extend(customParseFormat);

export type GNDToOwnModelMap = {
  [gndType: string]: {
    [slubField: string]: {
      path: string;
      type?: "string" | "number" | "boolean" | "array" | "object";
      mapping?: {
        strategy: "concatenate" | "first" | "last";
      };
    };
  };
};

interface Strategy {
  id: string;
}

export type StrategyContext = {
  getPrimaryIRIBySecondaryIRI: (
    secondaryIRI: string,
    authorityIRI: string,
    typeIRI: string,
  ) => Promise<string | null>;
  authorityIRI: string;
  newIRI: (typeIRI: string) => string;
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
    const primaryIRI = await getPrimaryIRIBySecondaryIRI(
      sourceDataElement.id,
      authorityIRI,
      typeIRI || "",
    );
    if (!primaryIRI) {
      const targetData = {
        "@id": newIRI(typeIRI || ""),
        "@type": typeIRI,
      };
      const entityIRI = primaryIRI || newIRI(typeIRI);
      newDataElements.push(
        await mapByConfig(
          sourceDataElement,
          targetData,
          subFieldMapping.fromEntity || [],
          context,
        ),
      );
    } else {
      newDataElements.push({
        "@id": primaryIRI,
      });
    }
  }
  return isArray ? newDataElements : newDataElements[0];
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
  return dayJsDateToSpecialInt(
    dayjs(data, yearOnly ? "YYYY" : "DD.MM.YYYY"),
    yearOnly,
  );
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
  | DateStringToSpecialInt;

export type DeclarativeSimpleMapping = {
  source: {
    path: string;
    expectedSchema?: JsonSchema;
  };
  target: {
    path: string;
  };
  mapping?: {
    strategy: AnyStrategy;
  };
};

export type DeclarativeMappings = DeclarativeSimpleMapping[];

export const strategyFunctionMap: { [strategyId: string]: StrategyFunction } = {
  concatenate,
  takeFirst,
  append,
  createEntity,
  dateStringToSpecialInt,
  dateRangeStringToSpecialInt,
};
