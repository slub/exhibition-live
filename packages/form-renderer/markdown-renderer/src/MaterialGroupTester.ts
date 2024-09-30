import {
  RankedTester,
  rankWith,
  uiTypeIs,
  withIncreasedRank,
} from "@jsonforms/core";

export const groupTester: RankedTester = rankWith(1, uiTypeIs("Group"));
export const materialGroupTester: RankedTester = withIncreasedRank(
  5,
  groupTester,
);
