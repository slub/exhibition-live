import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { OverflowChip } from "./OverflowChip";

export default {
  title: "components/basic-components/overflow/OverflowChip",
  component: OverflowChip,
} as Meta<typeof OverflowChip>;

type Story = StoryObj<typeof OverflowChip>;

export const Primary: Story = {
  args: {
    label: "Example Chip",
    secondary: "Detailed description here",
    entityIRI: "http://example.com/entity",
  },
};
