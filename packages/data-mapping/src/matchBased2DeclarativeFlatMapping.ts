import {
  AnyFlatStrategy,
  DeclarativeFlatMapping,
  DeclarativeFlatMappings,
} from "./mappingStrategies";
import flatten from "lodash/flatten";
import uniq from "lodash/uniq";
import dot from "dot";
import { JSONSchema7 } from "json-schema";
import { filterUndefOrNull } from "@slub/edb-core-utils";

type OwnColumnDesc = {
  index: number;
  value: string | number | null | boolean | any;
  letter: string;
};

const indexFromLetter = (letter: string, fields: OwnColumnDesc[]): number => {
  const index = fields.findIndex((m) => m.letter === letter);
  if (index === -1) {
    throw new Error(`No index for letter ${letter}`);
  }
  return index;
};
const indexFromTitle = (title: string, fields: OwnColumnDesc[]): number => {
  const index = fields.findIndex((m) => m.value === title);
  if (index === -1) {
    throw new Error(`No index for title ${title}`);
  }
  return index;
};
type MatchByTitle = {
  title: string[];
  includeRightNeighbours?: number;
};
type MatchNColumnsByTitlePattern = {
  titlePattern: string;
  amount: number;
  includeRightNeighbours?: number;
};
export type FlexibleColumnMatchingDefinition =
  | MatchByTitle
  | MatchNColumnsByTitlePattern;
const isTitlePattern = (
  definition: FlexibleColumnMatchingDefinition,
): definition is MatchNColumnsByTitlePattern => {
  return (definition as MatchNColumnsByTitlePattern).titlePattern !== undefined;
};
const resolveTitlePattern = (pattern: string, data: any): string => {
  const template = dot.template(pattern);
  return template(data);
};

const includeRightNeighbours = (
  firstIndex: number,
  count?: number,
): number[] => {
  if (typeof count === "number") {
    if (count <= 0) {
      throw new Error("includeRightNeighbours must be greater than 0");
    }
    return [...Array(count + 1)].map((_, i) => firstIndex + i);
  } else {
    return [firstIndex];
  }
};

const columnMatcherImplementation = (
  fields: OwnColumnDesc[],
  definition: FlexibleColumnMatchingDefinition,
): number[] => {
  if (isTitlePattern(definition)) {
    return flatten(
      [...Array(definition.amount)]
        .map((_, i) => {
          const title = resolveTitlePattern(definition.titlePattern, { i });
          return indexFromTitle(title, fields);
        })
        .map((firstIndex) =>
          includeRightNeighbours(firstIndex, definition.includeRightNeighbours),
        ),
    );
  } else {
    return flatten(
      definition.title
        .map((title) => indexFromTitle(title, fields))
        .map((firstIndex) =>
          includeRightNeighbours(firstIndex, definition.includeRightNeighbours),
        ),
    );
  }
};
/**
 * Returns the indices of the columns that match the given definition
 * @param fields The column description fields
 * @param definition  The definition of the columns to match (either by title or by title pattern)
 * @returns {number[]}   The indices of the columns that match the given definition
 */
const columnMatcher = (
  fields: OwnColumnDesc[],
  definition: FlexibleColumnMatchingDefinition,
): number[] => uniq(columnMatcherImplementation(fields, definition));

export type FlatSourceMatchBased = {
  columns: FlexibleColumnMatchingDefinition;
  expectedSchema?: JSONSchema7;
};
export type DeclarativeMatchBasedFlatMapping = {
  id: string;
  source: FlatSourceMatchBased;
  target: {
    path: string;
  };
  mapping?: {
    strategy: AnyFlatStrategy;
  };
};
export type DeclarativeMatchBasedFlatMappings =
  DeclarativeMatchBasedFlatMapping[];

/**
 * Converts a match based flat mapping to a declarative flat mapping
 *
 * the match based flat mapping is a more flexible way to define mappings upon tables that
 * can change over time, where a column index is not a stable identifier
 *
 * in order to use the flat mapping, column indices need to resolved based on the given
 * titles or title patterns within the table header, this is done by the {@link columnMatcher}
 *
 * @param fields
 * @param mapping
 */
export const matchBased2DeclarativeFlatMapping = (
  fields: OwnColumnDesc[],
  mapping: DeclarativeMatchBasedFlatMapping,
): DeclarativeFlatMapping => {
  return {
    ...mapping,
    source: {
      columns: columnMatcher(fields, mapping.source.columns),
      expectedSchema: mapping.source.expectedSchema,
    },
  };
};
export const matchBased2DeclarativeFlatMappings: (
  fields: OwnColumnDesc[],
  matchBasedFlatMappings: DeclarativeMatchBasedFlatMappings,
  options?: {
    throwOnMappingError?: boolean;
  },
) => DeclarativeFlatMappings = (fields, matchBasedFlatMappings, options) =>
  filterUndefOrNull(
    matchBasedFlatMappings.map((mapping) => {
      let res = null;
      try {
        res = matchBased2DeclarativeFlatMapping(fields, mapping);
      } catch (e) {
        if (options?.throwOnMappingError) {
          throw e;
        }
      }
      return res;
    }),
  );
