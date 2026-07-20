import type { Meta, StoryObj } from "@storybook/react";
import { X } from "./X";

const meta: Meta<typeof X> = {
  title: "Components/X",
  component: X,
  args: { type: "basic" },
};
export default meta;

type Story = StoryObj<typeof X>;

export const Default: Story = {};
