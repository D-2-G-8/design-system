import type { Meta, StoryObj } from "@storybook/react";
import { Avatar as Component } from "./Avatar";

const meta: Meta<typeof Component> = {
  title: "Components/Avatar",
  component: Component,
  args: {
    size: 48,
    type: "text",
    squared: false,
    text: "ВМ",
    badge: false,
    badgeValue: 5,
    editButton: false,
  },
  argTypes: {
    size: {
      control: "select",
      options: [24, 32, 40, 48, 64, 96],
    },
    type: {
      control: "select",
      options: ["img", "text", "icon"],
    },
    squared: {
      control: "boolean",
    },
    badge: {
      control: "boolean",
    },
    editButton: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const ImageRound: Story = {
  args: {
    type: "img",
    src: "https://via.placeholder.com/96",
    alt: "User avatar",
    size: 64,
    squared: false,
  },
};

export const ImageSquare: Story = {
  args: {
    type: "img",
    src: "https://via.placeholder.com/96",
    alt: "User avatar",
    size: 64,
    squared: true,
  },
};

export const TextRound: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 64,
    squared: false,
  },
};

export const TextSquare: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 64,
    squared: true,
  },
};

export const IconRound: Story = {
  args: {
    type: "icon",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    size: 64,
    squared: false,
  },
};

export const IconSquare: Story = {
  args: {
    type: "icon",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    size: 64,
    squared: true,
  },
};

export const WithBadge: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 64,
    squared: false,
    badge: true,
    badgeValue: 5,
  },
};

export const WithEditButton: Story = {
  args: {
    type: "img",
    src: "https://via.placeholder.com/96",
    alt: "User avatar",
    size: 96,
    squared: false,
    editButton: true,
  },
};

export const WithBadgeAndEdit: Story = {
  args: {
    type: "img",
    src: "https://via.placeholder.com/96",
    alt: "User avatar",
    size: 96,
    squared: false,
    badge: true,
    badgeValue: 5,
    editButton: true,
  },
};

export const Small24: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 24,
    squared: false,
  },
};

export const Medium32: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 32,
    squared: false,
  },
};

export const Medium40: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 40,
    squared: false,
  },
};

export const Large96: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: 96,
    squared: false,
  },
};
