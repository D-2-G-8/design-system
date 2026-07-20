import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  args: {
    appearance: "default",
    filled: false,
    labelOutside: false,
    error: false,
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Textarea>;

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

export const Error: Story = {
  args: {
    error: true,
  },
};

export const ErrorFilled: Story = {
  args: {
    error: true,
    filled: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledFilled: Story = {
  args: {
    disabled: true,
    filled: true,
  },
};
