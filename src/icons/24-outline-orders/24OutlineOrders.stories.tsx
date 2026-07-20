import type { Meta, StoryObj } from "@storybook/react";
import { 24OutlineOrders as Component } from "./24OutlineOrders";

const meta: Meta<typeof Component> = {
  title: "Icons/24OutlineOrders",
  component: Component,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
