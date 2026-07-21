import type { Meta, StoryObj } from "@storybook/react";
import { TooltipLightMobileLeftOffOff as Component } from "./TooltipLightMobileLeftOffOff";

const meta: Meta<typeof Component> = {
  title: "Icons/TooltipLightMobileLeftOffOff",
  component: Component,
  args: {
    text: "Tooltip text",
  },
  argTypes: {
    text: {
      description: "The text content to display inside the tooltip; pass the string you want shown to the user.",
      control: "text",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
