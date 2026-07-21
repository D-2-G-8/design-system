import type { Meta, StoryObj } from "@storybook/react";
import { Badgecount as Component } from "./Badgecount";

const meta: Meta<typeof Component> = {
  title: "Components/Badgecount",
  component: Component,
  args: {
    value: 5,
    size: "24",
    appearance: "default",
    squared: false,
  },
  argTypes: {
    value: {
      description:
        "The numeric or text value displayed inside the badge; pass a number for counts (e.g. 5) or a short string (e.g. \"99+\"), or omit to render the XS dot-only variant.",
    },
    size: {
      description:
        "Visual size of the badge; defaults to '24' for typical notification counts, use 'xs' for a small indicator dot without text, and '32' for prominent counters.",
      control: { type: "select" },
      options: ["xs", "16", "20", "24", "32"],
    },
    appearance: {
      description:
        "Color theme of the badge; 'default' is white background, 'negative' is red for errors/alerts, 'neutral' is gray, and 'accent' is black; defaults to 'default'.",
      control: { type: "select" },
      options: ["default", "negative", "neutral", "accent"],
    },
    squared: {
      description:
        "Whether to use squared corners (8px/12px radius depending on size) instead of fully rounded pill shape; defaults to false for the standard pill appearance.",
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
    appearance: "negative",
  },
};

export const Size20: Story = {
  args: {
    size: "20",
    appearance: "negative",
  },
};

export const Size16: Story = {
  args: {
    size: "16",
    appearance: "negative",
  },
};

export const XSDot: Story = {
  args: {
    size: "xs",
    appearance: "negative",
    value: undefined,
  },
};

export const Squared: Story = {
  args: {
    squared: true,
    appearance: "negative",
  },
};

export const SquaredSize32: Story = {
  args: {
    size: "32",
    squared: true,
    appearance: "accent",
  },
};

export const HighCount: Story = {
  args: {
    value: "99+",
    appearance: "negative",
  },
};

export const NeutralSquared: Story = {
  args: {
    appearance: "neutral",
    squared: true,
    size: "24",
  },
};

export const DefaultSquared: Story = {
  args: {
    appearance: "default",
    squared: true,
    size: "20",
  },
};
