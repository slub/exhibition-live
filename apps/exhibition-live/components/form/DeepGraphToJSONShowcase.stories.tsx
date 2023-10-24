import { boolean, number } from "@storybook/addon-knobs";
import { ComponentMeta } from "@storybook/react";

import DeepGraphToJSONShowcase from "./DeepGraphToJSONShowcase";

export default {
  title: "form/exhibition/DeepGraphToJSONShowcase",
  component: DeepGraphToJSONShowcase,
} as ComponentMeta<typeof DeepGraphToJSONShowcase>;

export const DeepGraphToJSONShowcaseDefault = () => {
  const omitEmptyArrays = boolean("omit empty arrays", true);
  const omitEmptyObjects = boolean("omit empty objects", true);
  const maxRecursion = number("max recursion", 5, { min: 0, max: 20 });
  const maxRecursionEachRef = number("max rec each $ref", 2, {
    min: 0,
    max: 20,
  });
  return (
    <DeepGraphToJSONShowcase
      omitEmptyArrays={omitEmptyArrays}
      omitEmptyObjects={omitEmptyObjects}
      maxRecursion={maxRecursion}
      maxRecursionEachRef={maxRecursionEachRef}
    />
  );
};
