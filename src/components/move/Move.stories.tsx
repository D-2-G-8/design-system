import type { Meta, StoryObj } from "@storybook/react";
import { Move } from "./Move";

const meta: Meta<typeof Move> = {
  title: "Components/Move",
  component: Move,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Move>;

export const Default: Story = {};
