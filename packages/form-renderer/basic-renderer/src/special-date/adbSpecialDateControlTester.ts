import {
  and,
  isIntegerControl,
  or,
  RankedTester,
  rankWith,
  scopeEndsWith,
} from "@jsonforms/core";

export const adbSpecialDateControlTester: RankedTester = rankWith(
  6,
  and(isIntegerControl, or(scopeEndsWith("dateValue"), scopeEndsWith("Date"))),
);
