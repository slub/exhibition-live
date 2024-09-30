import {
  and,
  isObjectArray,
  optionIs,
  RankedTester,
  rankWith,
} from "@jsonforms/core";

export const materialArrayChipsLayoutTester: RankedTester = rankWith(
  6,
  and(optionIs("chips", true), isObjectArray),
);
