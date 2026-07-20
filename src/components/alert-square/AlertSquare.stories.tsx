import type { Meta, StoryObj } from "@storybook/react";
import { AlertSquare } from "./AlertSquare";

const meta: Meta<typeof AlertSquare> = {
  title: "Components/AlertSquare",
  component: AlertSquare,
  args: {},
};
export default meta;

type Story = StoryObj<typeof AlertSquare>;

export const Default: Story = {};
