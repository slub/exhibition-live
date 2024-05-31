import { isBooleanControl, RankedTester, rankWith } from "@jsonforms/core";

export const materialBooleanControlTester: RankedTester = rankWith(
  5,
  isBooleanControl,
);
