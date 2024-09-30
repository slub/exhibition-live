import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ClassicResultListItem } from "./ClassicResultListItem";

export default {
  title: "components/basic-components/list/ClassicResultListItem",
  component: ClassicResultListItem,
} as Meta<typeof ClassicResultListItem>;

type Story = StoryObj<typeof ClassicResultListItem>;

export const Primary: Story = {
  args: {
    id: "list-item-1",
    index: 0,
    onSelected: (id: string, index: number) =>
      console.log(`Selected: ${id} at index ${index}`),
    avatar: "http://example.com/avatar.png",
    label: "Primary Example",
    secondary: "This is a secondary text example",
    category: "Category Example",
    altAvatar: "A",
    selected: false,
  },
};
