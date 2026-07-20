import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox2 } from "./Checkbox2";

const meta: Meta<typeof Checkbox2> = {
  title: "Components/Checkbox2",
  component: Checkbox2,
  args: {
    size: 16,
    checked: false,
    indeterminate: false,
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox2>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    indeterminate: true,
  },
};
