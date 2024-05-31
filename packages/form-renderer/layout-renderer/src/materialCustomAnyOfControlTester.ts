import { isAnyOfControl, RankedTester, rankWith } from "@jsonforms/core";

export const materialCustomAnyOfControlTester: RankedTester = rankWith(
  5,
  isAnyOfControl,
);
