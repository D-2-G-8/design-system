import type { Meta, StoryObj } from "@storybook/react";
import { TooltipLightMobileLeftOffOff as Component } from "./TooltipLightMobileLeftOffOff";

const meta: Meta<typeof Component> = {
  title: "Components/TooltipLightMobileLeftOffOff",
  component: Component,
  args: {
    text: "Tooltip message",
  },
  argTypes: {
    text: {
      description: "The text content displayed inside the tooltip; pass the message you want to show to the user when the tooltip appears.",
      control: "text",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
