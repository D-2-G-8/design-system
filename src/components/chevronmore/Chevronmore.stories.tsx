import type { Meta, StoryObj } from "@storybook/react";
import { Chevronmore } from "./Chevronmore";

const meta: Meta<typeof Chevronmore> = {
  title: "Components/Chevronmore",
  component: Chevronmore,
  args: { state: "none" },
};
export default meta;

type Story = StoryObj<typeof Chevronmore>;

export const Default: Story = {};
export const Open: Story = { args: { state: "open" } };
export const Close: Story = { args: { state: "close" } };
export const Included: Story = { args: { state: "included" } };
