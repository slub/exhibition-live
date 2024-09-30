import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { OverflowText } from "./OverflowText";

export default {
  title: "components/basic-components/overflow/OverflowText",
  component: OverflowText,
} as Meta<typeof OverflowText>;

type Story = StoryObj<typeof OverflowText>;

export const Primary: Story = {
  args: {
    children: "A long text that needs to be stripped",
  },
};
