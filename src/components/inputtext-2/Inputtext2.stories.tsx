import type { Meta, StoryObj } from "@storybook/react";
import { Inputtext2 } from "./Inputtext2";

const meta: Meta<typeof Inputtext2> = {
  title: "Components/Inputtext2",
  component: Inputtext2,
  args: {
    size: "40px",
    filled: false,
    labelOutside: false,
  },
};
export default meta;

type Story = StoryObj<typeof Inputtext2>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    filled: true,
  },
};

export const LabelOutside: Story = {
  args: {
    labelOutside: true,
  },
};

export const FilledWithLabelOutside: Story = {
  args: {
    filled: true,
    labelOutside: true,
  },
};
