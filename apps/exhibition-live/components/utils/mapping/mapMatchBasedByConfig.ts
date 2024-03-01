import {OwnColumnDesc} from "../../google/types";
import {AnyFlatStrategy, DeclarativeFlatMapping} from "./mappingStrategies";
import {flatten} from "lodash";
import {JsonSchema} from "@jsonforms/core";
import dot from "dot";

export const indexFromLetter = (
  letter: string,
  fields: OwnColumnDesc[],
): number => {
  const index = fields.findIndex((m) => m.letter === letter);
  if (index === -1) {
    throw new Error(`No index for letter ${letter}`);
  }
  return index;
};
export const indexFromTitle = (
  title: string,
  fields: OwnColumnDesc[],
): number => {
  const index = fields.findIndex((m) => m.value === title);
  if (index === -1) {
    throw new Error(`No index for title ${title}`);
  }
  return index;
};
type MatchByTitle = {
  title: string[];
}
type MatchNColumnsByTitlePattern = {
  titlePattern: string;
  amount: number;
  includeRightNeighbours?: number;
}
export type FlexibleColumnMatchingDefinition = MatchByTitle | MatchNColumnsByTitlePattern;
export const isTitlePattern = (definition: FlexibleColumnMatchingDefinition): definition is MatchNColumnsByTitlePattern => {
  return (definition as MatchNColumnsByTitlePattern).titlePattern !== undefined;
}
const resolveTitlePattern = (pattern: string, data: any): string => {
  const template = dot.template(pattern);
  return template(data);
}
/**
 * Returns the indices of the columns that match the given definition
 * @param fields The column description fields
 * @param definition  The definition of the columns to match (either by title or by title pattern)
 * @returns {number[]}   The indices of the columns that match the given definition
 */
const columnMatcher = (fields: OwnColumnDesc[], definition: FlexibleColumnMatchingDefinition): number[] => {
  if (isTitlePattern(definition)) {
    return flatten([...Array(definition.amount)].map((_, i) => {
      const title = resolveTitlePattern(definition.titlePattern, {i});
      return indexFromTitle(title, fields);
    }).map(firstIndex => {
      if (typeof definition.includeRightNeighbours === "number") {
        if (definition.includeRightNeighbours <= 0) {
          throw new Error("includeRightNeighbours must be greater than 0");
        }
        return [...Array(definition.amount)].map((_, i) => firstIndex + i);
      } else {
        return [firstIndex];
      }
    }))
  } else {
    return definition.title.map((title) => indexFromTitle(title, fields));
  }
}
export type FlatSourceMatchBased = {
  columns: FlexibleColumnMatchingDefinition;
  expectedSchema?: JsonSchema;
}
export type DeclarativeMatchBasedFlatMapping = {
  source: FlatSourceMatchBased;
  target: {
    path: string;
  };
  mapping?: {
    strategy: AnyFlatStrategy;
  };
};
export type DeclarativeMatchBasedFlatMappings = DeclarativeMatchBasedFlatMapping[];
export const matchBased2DeclarativeFlatMapping = (fields: OwnColumnDesc[], mapping: DeclarativeMatchBasedFlatMapping): DeclarativeFlatMapping => {
  return {
    source: {
      columns: columnMatcher(fields, mapping.source.columns),
      expectedSchema: mapping.source.expectedSchema
    },
    target: mapping.target,
    mapping: mapping.mapping
  }
}
