import {
  DeclarativeFlatMappings,
  DeclarativeMatchBasedFlatMappings,
  matchBased2DeclarativeFlatMapping,
} from "@slub/edb-data-mapping";
import { filterUndefOrNull } from "@slub/edb-core-utils";
export type OwnColumnDesc = {
  index: number;
  value: string | null;
  letter: string;
};
export const calculateFlatMappings: (
  fields: OwnColumnDesc[],
  matchBasedFlatMappings: DeclarativeMatchBasedFlatMappings,
) => DeclarativeFlatMappings = (fields, matchBasedFlatMappings) =>
  filterUndefOrNull(
    matchBasedFlatMappings.map((mapping) => {
      return matchBased2DeclarativeFlatMapping(fields, mapping);
    }),
  );
