import { matchBasedSpreadsheetMappings_NewYork } from "./spreadSheetMappings_NewYork";
import { DeclarativeMatchBasedFlatMappings } from "@slub/edb-data-mapping";

export type AvailableFlatMappings = Record<
  string,
  { mapping: DeclarativeMatchBasedFlatMappings; typeName: string }
>;
export const avaiableFlatMappings: AvailableFlatMappings = {
  NewYork: {
    typeName: "Exhibition",
    mapping: matchBasedSpreadsheetMappings_NewYork,
  },
} as const;
