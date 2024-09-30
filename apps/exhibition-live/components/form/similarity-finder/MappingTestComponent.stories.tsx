import { MappingTestComponent } from "./MappingTestComponent";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof MappingTestComponent> = {
  title: "mapping/MappingTestComponent",
  component: MappingTestComponent,
};
export default meta;

type Story = StoryObj<typeof MappingTestComponent>;

export const Primary: Story = {
  args: {
    typeName: "Location",
  },
};
