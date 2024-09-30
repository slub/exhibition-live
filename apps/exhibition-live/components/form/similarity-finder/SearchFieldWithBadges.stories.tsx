import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { SearchFieldWithBadges } from "./SearchFieldWithBadges";
import { KnowledgeBaseDescription } from "./types";

export default {
  title: "ui/similarity-finder/SearchFieldWithBadges",
  component: SearchFieldWithBadges,
} as Meta<typeof SearchFieldWithBadges>;

type Story = StoryObj<typeof SearchFieldWithBadges>;

const knowledgeBases: KnowledgeBaseDescription[] = [
  {
    id: "kb",
    label: "Knowledge Base Blue",
    icon: (
      <div style={{ width: 20, height: 20, backgroundColor: "blue" }}></div>
    ),
    description: "This is a description of the knowledge base blue",
    find: (searchString) => Promise.resolve([]),
  },
  {
    id: "wikidata",
    label: "Knowledge Base Green",
    icon: (
      <div style={{ width: 20, height: 20, backgroundColor: "green" }}></div>
    ),
    description: "This is a description of the knowledge base green",
    find: (searchString) => Promise.resolve([]),
  },
];

export const Primary: Story = {
  args: {
    searchString: "Sample search",
    typeIRI: "http://example.com/type",
    onSearchStringChange: (value: string) =>
      console.log(`Search Changed: ${value}`),
    knowledgeBases: knowledgeBases,
    selectedKnowledgeSources: ["kb"],
    advancedConfigChildren: <div>Advanced Config</div>,
  },
};
