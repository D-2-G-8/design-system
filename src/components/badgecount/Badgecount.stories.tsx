import type { Meta, StoryObj } from "@storybook/react";
import { Badgecount as Component } from "./Badgecount";

const meta: Meta<typeof Component> = {
  title: "Components/Badgecount",
  component: Component,
  args: { 
    value: 5,
    size: "24",
    appearance: "default",
    square: false
  },
  argTypes: {
    value: {
      description: "The numeric or text value displayed inside the badge; pass a number for counts or a short string for labels.",
      control: "text"
    },
    size: {
      description: "Visual size of the badge in pixels; defaults to '24' if omitted, with 'xs' rendering an 8px dot without text.",
      control: { type: "select" },
      options: ["xs", "16", "20", "24", "32"]
    },
    appearance: {
      description: "Color theme of the badge; 'default' uses white background, 'negative' uses red, 'neutral' uses gray, 'accent' uses black, defaults to 'default' if omitted.",
      control: { type: "select" },
      options: ["default", "negative", "neutral", "accent"]
    },
    square: {
      description: "Whether to render the badge with square corners instead of fully rounded; pass true for square, omit or pass false for rounded.",
      control: "boolean"
    }
  }
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Negative: Story = {
  args: {
    appearance: "negative"
  }
};

export const Neutral: Story = {
  args: {
    appearance: "neutral"
  }
};

export const Accent: Story = {
  args: {
    appearance: "accent"
  }
};

export const Size32: Story = {
  args: {
    size: "32",
    appearance: "negative"
  }
};

export const Size20: Story = {
  args: {
    size: "20",
    appearance: "negative"
  }
};

export const Size16: Story = {
  args: {
    size: "16",
    appearance: "negative"
  }
};

export const SizeXS: Story = {
  args: {
    size: "xs",
    appearance: "negative"
  }
};

export const Square: Story = {
  args: {
    square: true,
    appearance: "negative"
  }
};

export const SquareSize32: Story = {
  args: {
    size: "32",
    square: true,
    appearance: "accent"
  }
};

export const SquareSize16: Story = {
  args: {
    size: "16",
    square: true,
    appearance: "neutral"
  }
};

export const SquareXS: Story = {
  args: {
    size: "xs",
    square: true,
    appearance: "accent"
  }
};

export const LargeValue: Story = {
  args: {
    value: 99,
    size: "32",
    appearance: "negative"
  }
};

export const TextValue: Story = {
  args: {
    value: "NEW",
    size: "24",
    appearance: "accent"
  }
};