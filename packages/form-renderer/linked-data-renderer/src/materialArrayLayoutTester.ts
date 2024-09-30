import {
  isObjectArrayWithNesting,
  RankedTester,
  rankWith,
} from "@jsonforms/core";

export const materialArrayLayoutTester: RankedTester = rankWith(
  4,
  isObjectArrayWithNesting,
);
