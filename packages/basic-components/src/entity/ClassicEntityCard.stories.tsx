import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { ClassicEntityCard, ClassicEntityCardProps } from "./ClassicEntityCard";

const meta: Meta<typeof ClassicEntityCard> = {
  title: "components/basic-components/entity/ClassicEntityCard",
  component: ClassicEntityCard,
};

export default meta;

type Story = StoryObj<typeof ClassicEntityCard>;

export const Default: Story = {
  args: {
    data: {
      id: "1",
      label: "Sample Label",
      title: "Sample Title",
      name: "Sample Name",
      description: "This is a sample description for the ClassicEntityCard.",
      avatar: "https://picsum.photos/300/300",
    },
    id: "1",
    onBack: () => alert("Back button clicked"),
    cardActionChildren: <button>Action</button>,
    detailView: <div>Detail View Content</div>,
  } as ClassicEntityCardProps,
};
