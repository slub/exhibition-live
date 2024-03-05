import { ComponentMeta } from "@storybook/react";

import DeepGraphToJSONShowcase from "./DeepGraphToJSONShowcase";

export default {
  title: "form/exhibition/DeepGraphToJSONShowcase",
  component: DeepGraphToJSONShowcase,
} as ComponentMeta<typeof DeepGraphToJSONShowcase>;

export const DeepGraphToJSONShowcaseDefault = () => {
  return (
    <DeepGraphToJSONShowcase
      omitEmptyArrays={true}
      omitEmptyObjects={true}
      maxRecursion={5}
      maxRecursionEachRef={2}
      skipAtLevel={2}
    />
  );
};
