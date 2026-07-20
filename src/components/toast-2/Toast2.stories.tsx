import type { Meta, StoryObj } from "@storybook/react";
import { Toast2 } from "./Toast2";

const meta: Meta<typeof Toast2> = {
  title: "Components/Toast2",
  component: Toast2,
  args: {
    size: "l",
    appearance: "default",
    button: false,
    desc: false,
  },
};
export default meta;

type Story = StoryObj<typeof Toast2>;

export const Default: Story = {};

export const LargeDefault: Story = {
  args: {
    size: "l",
    appearance: "default",
    button: false,
    desc: false,
  },
};

export const MediumDefault: Story = {
  args: {
    size: "m",
    appearance: "default",
    button: false,
    desc: false,
  },
};

export const NegativeWithButton: Story = {
  args: {
    appearance: "negative",
    button: true,
  },
};

export const PositiveWithDescription: Story = {
  args: {
    appearance: "positive",
    desc: true,
  },
};

export const NegativeWithButtonAndDescription: Story = {
  args: {
    appearance: "negative",
    button: true,
    desc: true,
  },
};

export const PositiveSmall: Story = {
  args: {
    size: "m",
    appearance: "positive",
  },
};
