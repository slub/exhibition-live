---
to: packages/<%= name.split("/")[1] %>/src/<%= h.changeCase.pascal(name.split("/")[1]) %>.stories.tsx
---
<%
  const packageName = name.split("/")[1];
  const ComponentName = h.changeCase.pascal(packageName);
%>
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { <%= ComponentName %>, <%= ComponentName %>Props } from './<%= ComponentName %>';

const meta: Meta<typeof <%= ComponentName %>> = {
  component: <%= ComponentName %>,
  title: 'Components/<%= ComponentName %>',
  argTypes: {
    name: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof <%= ComponentName %>>;

export const Default: Story = {
  args: {
    name: 'World',
  },
};

export const CustomName: Story = {
  args: {
    name: 'Storybook',
  },
};

export const LongName: Story = {
  args: {
    name: 'This is a very long name to test wrapping',
  },
};
