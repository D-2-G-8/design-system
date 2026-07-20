import type { Meta, StoryObj } from "@storybook/react";
import { Chevrondown } from "./Chevrondown";

const meta: Meta<typeof Chevrondown> = {
  title: "Components/Chevrondown",
  component: Chevrondown,
  args: { type: "basic" },
};
export default meta;

type Story = StoryObj<typeof Chevrondown>;

export const Default: Story = {};
export const Basic: Story = { args: { type: "basic" } };
