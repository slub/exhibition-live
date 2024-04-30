import get from "lodash/get";
import {
  FieldExtractDeclaration,
  PrimaryFieldExtract,
  PrimaryFieldResults,
} from "@slub/edb-core-types";

export const extractFieldAny = (
  entry: any | null,
  fieldExtractDeclaration: FieldExtractDeclaration,
): any => {
  if (!entry) return null;
  if (typeof fieldExtractDeclaration === "string") {
    return entry[fieldExtractDeclaration];
  } else if (typeof fieldExtractDeclaration === "function") {
    return fieldExtractDeclaration(entry);
  } else if (typeof fieldExtractDeclaration === "object") {
    return get(entry, fieldExtractDeclaration.path);
  }
};
export const extractFieldIfString = (
  entry: any | null,
  fieldExtractDeclaration: FieldExtractDeclaration,
): string | null => {
  try {
    const value = extractFieldAny(entry, fieldExtractDeclaration);
    if (typeof value !== "string") {
      return null;
    } else {
      return value;
    }
  } catch (e) {
    return null;
  }
};

export const applyToEachField = <R, T = any>(
  entry: T,
  fieldExtract: PrimaryFieldExtract<T>,
  fn: (value: T, primaryFieldExtarctDeclaration: FieldExtractDeclaration) => R,
): PrimaryFieldResults<R> => {
  return {
    label: fieldExtract?.label ? fn(entry, fieldExtract.label) : null,
    description: fieldExtract?.description
      ? fn(entry, fieldExtract.description)
      : null,
    image: fieldExtract?.image ? fn(entry, fieldExtract.image) : null,
  };
};
