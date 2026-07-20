import type { Meta, StoryObj } from "@storybook/react";
import { FingerScrollDown } from "./FingerScrollDown";

const meta: Meta<typeof FingerScrollDown> = {
  title: "Components/FingerScrollDown",
  component: FingerScrollDown,
  args: {},
};
export default meta;

type Story = StoryObj<typeof FingerScrollDown>;

export const Default: Story = {};
