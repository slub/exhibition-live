import { matchBasedSpreadsheetMappings_NewYork } from "./spreadSheetMappings_NewYork";
import { AvailableFlatMappings } from "@slub/edb-global-types";

export const availableFlatMappings: AvailableFlatMappings = {
  NewYork: {
    typeName: "Exhibition",
    mapping: matchBasedSpreadsheetMappings_NewYork,
  },
} as const;
