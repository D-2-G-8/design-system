import type { Meta, StoryObj } from "@storybook/react";
import { FillProfile2 as Component } from "./FillProfile2";

const meta: Meta<typeof Component> = {
  title: "Icons/FillProfile2",
  component: Component,
  args: { size: 24 },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
export const Large: Story = { args: { size: 48 } };
