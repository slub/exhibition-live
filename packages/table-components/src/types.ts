import { ColumnDefMatcher } from "./listHelper";
import { VisibilityState } from "@tanstack/table-core";

export type ListConfigType = {
  columnVisibility: VisibilityState;
  matcher: ColumnDefMatcher;
};
export type TableConfigRegistry = {
  default: Partial<ListConfigType>;
  [typeName: string]: Partial<ListConfigType>;
};
