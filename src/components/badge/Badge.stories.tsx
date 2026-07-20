import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  args: {
    size: 40,
    type: "label",
    appearance: "default",
    fill: false,
    theme: "light",
    children: "Badge",
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Size24: Story = {
  args: {
    size: 24,
  },
};

export const Size32: Story = {
  args: {
    size: 32,
  },
};

export const Size40: Story = {
  args: {
    size: 40,
  },
};

export const Success: Story = {
  args: {
    appearance: "success",
    size: 24,
  },
};

export const SuccessFilled: Story = {
  args: {
    appearance: "success",
    fill: true,
    size: 24,
  },
};

export const Info: Story = {
  args: {
    appearance: "info",
  },
};

export const InfoFilled: Story = {
  args: {
    appearance: "info",
    fill: true,
  },
};

export const Error: Story = {
  args: {
    appearance: "error",
  },
};

export const ErrorFilled: Story = {
  args: {
    appearance: "error",
    fill: true,
  },
};

export const Warning: Story = {
  args: {
    appearance: "warning",
  },
};

export const WarningFilled: Story = {
  args: {
    appearance: "warning",
    fill: true,
  },
};

export const Emoji: Story = {
  args: {
    type: "emoji",
    children: "🎉",
  },
};

export const Icon: Story = {
  args: {
    type: "icon",
  },
};

export const Lottie: Story = {
  args: {
    type: "lottie",
  },
};

export const Logo: Story = {
  args: {
    type: "logo",
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
  },
};
