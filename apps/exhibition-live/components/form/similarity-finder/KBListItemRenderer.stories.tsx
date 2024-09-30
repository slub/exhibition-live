import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { BasicThingInformation } from "@slub/edb-core-types";
import { KBListItemRenderer } from "./KBListItemRenderer";

export default {
  title: "ui/similarity-finder/KBListItemRenderer",
  component: KBListItemRenderer,
} as Meta<typeof KBListItemRenderer>;

type Story = StoryObj<typeof KBListItemRenderer>;

const sampleData: BasicThingInformation = {
  id: "example-id",
  label: "Example Label",
  avatar: "http://example.com/avatar.png",
  secondary: "Additional Information",
};

export const Primary: Story = {
  args: {
    data: sampleData,
    idx: 1,
    typeIRI: "http://example.org/type",
    selected: false,
  },
};

export const VeryLongDescription: Story = {
  args: {
    data: {
      ...sampleData,
      secondary:
        "This is a very long description that should be truncated. We can continue to write a lot of text here, but it will be cut off at some point. The item should still be displayed correctly.",
    },
    idx: 1,
    typeIRI: "http://example.org/type",
    selected: false,
  },
};
