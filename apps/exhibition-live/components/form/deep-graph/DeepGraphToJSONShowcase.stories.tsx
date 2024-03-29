import DeepGraphToJSONShowcase from "./DeepGraphToJSONShowcase";
import { Meta, StoryObj } from "@storybook/react";

export default {
  title: "form/exhibition/DeepGraphToJSONShowcase",
  component: DeepGraphToJSONShowcase,
} as Meta<typeof DeepGraphToJSONShowcase>;

type Story = StoryObj<typeof DeepGraphToJSONShowcase>;

export const DeepGraphToJSONShowcasePrimary: Story = {
  args: {
    baseIRI: "http://schema.org/",
    entityIRI: "http://localhost:8080/data/person/leonard-hofstadter",
    omitEmptyArrays: true,
    omitEmptyObjects: true,
    maxRecursion: 5,
    maxRecursionEachRef: 2,
    skipAtLevel: 2,
  },
};
