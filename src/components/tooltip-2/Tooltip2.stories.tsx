import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip2 } from "./Tooltip2";

const meta: Meta<typeof Tooltip2> = {
  title: "Components/Tooltip2",
  component: Tooltip2,
  args: {
    direction: "up",
    theme: "light",
    appearance: "mobile",
    leftAligned: false,
    rightAligned: false,
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip2>;

export const Default: Story = {};

export const Up: Story = {
  args: {
    direction: "up",
  },
};

export const Left: Story = {
  args: {
    direction: "left",
  },
};

export const Right: Story = {
  args: {
    direction: "right",
  },
};

export const Down: Story = {
  args: {
    direction: "down",
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
};

export const Desktop: Story = {
  args: {
    appearance: "desktop",
  },
};

export const LeftAligned: Story = {
  args: {
    leftAligned: true,
  },
};

export const RightAligned: Story = {
  args: {
    rightAligned: true,
  },
};

export const DarkDesktopDown: Story = {
  args: {
    theme: "dark",
    appearance: "desktop",
    direction: "down",
  },
};
