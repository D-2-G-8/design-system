import type { Meta, StoryObj } from "@storybook/react";
import { FingerScrollUp } from "./FingerScrollUp";

const meta: Meta<typeof FingerScrollUp> = {
  title: "Components/FingerScrollUp",
  component: FingerScrollUp,
  args: {},
};
export default meta;

type Story = StoryObj<typeof FingerScrollUp>;

export const Default: Story = {};
