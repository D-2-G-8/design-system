import type { Meta, StoryObj } from "@storybook/react";
import { N24OutlineOrders as Component } from "./N24OutlineOrders";

const meta: Meta<typeof Component> = {
  title: "Icons/N24OutlineOrders",
  component: Component,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
