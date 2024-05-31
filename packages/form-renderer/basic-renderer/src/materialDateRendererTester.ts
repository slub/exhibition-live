import { isDateControl, RankedTester, rankWith } from "@jsonforms/core";

export const materialDateRendererTester: RankedTester = rankWith(
  6,
  isDateControl,
);
