import type { Meta, StoryObj } from "@storybook/react";
import { OutlineRegularClose as Component } from "./OutlineRegularClose";

const meta: Meta<typeof Component> = {
  title: "Icons/OutlineRegularClose",
  component: Component,
  argTypes: {
    className: {
      description: "Additional CSS class name(s) to apply to the SVG element",
      control: "text",
    },
    style: {
      description: "Inline styles to apply to the SVG element",
      control: "object",
    },
    onClick: {
      description: "Click event handler",
      action: "clicked",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};