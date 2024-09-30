import { Meta, StoryObj } from "@storybook/react";
import { QuerySparnatural } from "./QuerySparnatural";

const meta: Meta<typeof QuerySparnatural> = {
  component: QuerySparnatural,
  title: "Components/QuerySparnatural",
};

export default meta;
type Story = StoryObj<typeof QuerySparnatural>;

export const Default: Story = {
  args: {
    lang: "en",
  },
};
