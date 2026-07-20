import type { Meta, StoryObj } from "@storybook/react";
import { ChevronDown } from "./ChevronDown";

const meta: Meta<typeof ChevronDown> = {
  title: "Components/ChevronDown",
  component: ChevronDown,
  args: {},
};
export default meta;

type Story = StoryObj<typeof ChevronDown>;

export const Default: Story = {};
