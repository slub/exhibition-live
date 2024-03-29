import { JSONSchema4, JSONSchema7 } from "json-schema";

export type JsonSchema = JSONSchema7 | JSONSchema4;

export type WalkerOptions = {
  omitEmptyArrays: boolean;
  omitEmptyObjects: boolean;
  maxRecursionEachRef: number;
  maxRecursion: number;
  skipAtLevel: number;
  doNotRecurseNamedNodes?: boolean;
};
