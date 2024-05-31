import { isObjectControl, RankedTester, rankWith } from "@jsonforms/core";

export const materialLinkedObjectControlTester: RankedTester = rankWith(
  4,
  isObjectControl,
);
