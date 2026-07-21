import type { Meta, StoryObj } from "@storybook/react";
import { TooltipLightMobileLeftOffOff as Component } from "./TooltipLightMobileLeftOffOff";

const meta: Meta<typeof Component> = {
  title: "Icons/TooltipLightMobileLeftOffOff",
  component: Component,
  args: { text: "Tooltip text" },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
