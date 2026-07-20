import type { Meta, StoryObj } from "@storybook/react";
import { Button40 } from "./Button40";

const meta: Meta<typeof Button40> = {
  title: "Components/Button40",
  component: Button40,
  args: { type: "regular" },
};
export default meta;

type Story = StoryObj<typeof Button40>;

export const Default: Story = {};
export const Regular: Story = { args: { type: "regular" } };
export const Text: Story = { args: { type: "text" } };
