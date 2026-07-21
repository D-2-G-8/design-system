import type { Meta, StoryObj } from "@storybook/react";
import { Badgecount as Component } from "./Badgecount";

const meta: Meta<typeof Component> = {
  title: "Components/Badgecount",
  component: Component,
  args: {
    value: "5",
    size: "24",
    appearance: "default",
    square: false,
  },
  argTypes: {
    value: {
      description:
        "The count or label to display inside the badge; can be a number like 5 or 99+, or a short string.",
      control: "text",
    },
    size: {
      description:
        "Badge size in pixels or 'xs' for an 8×8 dot with no text; defaults to '24' for a standard numeric badge.",
      control: { type: "select" },
      options: ["xs", "16", "20", "24", "32"],
    },
    appearance: {
      description:
        "Visual style of the badge: 'default' for white background, 'negative' for red (errors/alerts), 'neutral' for gray, or 'accent' for black emphasis; defaults to 'default'.",
      control: { type: "select" },
      options: ["default", "negative", "neutral", "accent"],
    },
    square: {
      description:
        "When true, uses a rounded-square shape instead of fully circular; defaults to false for circular badges.",
      control: "boolean",
    },
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

export const Size32: Story = {
  args: {
    size: "32",
  },
};

export const Size20: Story = {
  args: {
    size: "20",
  },
};

export const Size16: Story = {
  args: {
    size: "16",
  },
};

export const ExtraSmall: Story = {
  args: {
    size: "xs",
    value: "",
  },
};

export const SquareShape: Story = {
  args: {
    square: true,
  },
};

export const SquareNegative: Story = {
  args: {
    square: true,
    appearance: "negative",
  },
};

export const LargeCount: Story = {
  args: {
    value: "99+",
    size: "32",
    appearance: "negative",
  },
};

export const AccentSquare32: Story = {
  args: {
    size: "32",
    appearance: "accent",
    square: true,
  },
};

export const NeutralSquare24: Story = {
  args: {
    size: "24",
    appearance: "neutral",
    square: true,
  },
};