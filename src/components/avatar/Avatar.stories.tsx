import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  args: {
    size: 40,
    type: "img",
    square: false,
    theme: "light",
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const Image24: Story = {
  args: {
    size: 24,
    type: "img",
  },
};

export const Image32: Story = {
  args: {
    size: 32,
    type: "img",
  },
};

export const Image48: Story = {
  args: {
    size: 48,
    type: "img",
  },
};

export const Image64: Story = {
  args: {
    size: 64,
    type: "img",
  },
};

export const Image96: Story = {
  args: {
    size: 96,
    type: "img",
  },
};

export const Text: Story = {
  args: {
    type: "text",
  },
};

export const Icon: Story = {
  args: {
    type: "icon",
  },
};

export const Square: Story = {
  args: {
    square: true,
    type: "img",
  },
};

export const SquareText: Story = {
  args: {
    square: true,
    type: "text",
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    type: "img",
  },
};

export const DarkThemeText: Story = {
  args: {
    theme: "dark",
    type: "text",
  },
};

export const Large96Square: Story = {
  args: {
    size: 96,
    square: true,
    type: "img",
  },
};
