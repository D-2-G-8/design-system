import type { Meta, StoryObj } from "@storybook/react";
import { BadgeCount as Component } from "./BadgeCount";

const meta: Meta<typeof Component> = {
  title: "Components/BadgeCount",
  component: Component,
  args: {
    value: "5",
    size: "32",
    appearance: "default",
    square: false,
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Negative: Story = {
  args: {
    appearance: "negative",
  },
};

export const Neutral: Story = {
  args: {
    appearance: "neutral",
  },
};

export const Accent: Story = {
  args: {
    appearance: "accent",
  },
};

export const Size32Square: Story = {
  args: {
    size: "32",
    square: true,
    appearance: "negative",
  },
};

export const Size24: Story = {
  args: {
    size: "24",
    appearance: "negative",
  },
};

export const Size24Square: Story = {
  args: {
    size: "24",
    square: true,
    appearance: "negative",
  },
};

export const Size20: Story = {
  args: {
    size: "20",
    appearance: "negative",
  },
};

export const Size20Square: Story = {
  args: {
    size: "20",
    square: true,
    appearance: "negative",
  },
};

export const Size16: Story = {
  args: {
    size: "16",
    appearance: "negative",
  },
};

export const Size16Square: Story = {
  args: {
    size: "16",
    square: true,
    appearance: "negative",
  },
};

export const SizeXS: Story = {
  args: {
    size: "xs",
    appearance: "negative",
    value: "",
  },
};

export const SizeXSSquare: Story = {
  args: {
    size: "xs",
    square: true,
    appearance: "negative",
    value: "",
  },
};

export const LargeNumber: Story = {
  args: {
    value: "99+",
    size: "32",
    appearance: "negative",
  },
};
