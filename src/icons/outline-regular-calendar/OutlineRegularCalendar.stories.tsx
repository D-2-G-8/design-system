import type { Meta, StoryObj } from "@storybook/react";
import { OutlineRegularCalendar as Component } from "./OutlineRegularCalendar";

const meta: Meta<typeof Component> = {
  title: "Icons/OutlineRegularCalendar",
  component: Component,
  args: { size: 24 },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
export const Large: Story = { args: { size: 48 } };
