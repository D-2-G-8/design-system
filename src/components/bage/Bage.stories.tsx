import type { Meta, StoryObj } from "@storybook/react";
import { Bage } from "./Bage";

const meta: Meta<typeof Bage> = {
  title: "Components/Bage",
  component: Bage,
  args: {
    children: "Badge",
    appearance: "primary",
    size: "sm",
    icon: "none",
    logo: false,
    emoji: false,
    theme: "light",
  },
};
export default meta;

type Story = StoryObj<typeof Bage>;

export const Default: Story = {};

export const XSmall: Story = {
  args: {
    size: "xs",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const WithIconLeft: Story = {
  args: {
    icon: "left",
  },
};

export const WithIconRight: Story = {
  args: {
    icon: "right",
  },
};

export const WithLogo: Story = {
  args: {
    logo: true,
  },
};

export const WithEmoji: Story = {
  args: {
    emoji: true,
  },
};

export const CustomColor: Story = {
  args: {
    color: "#10b981",
  },
};

export const XSmallWithIconLeft: Story = {
  args: {
    size: "xs",
    icon: "left",
  },
};

export const SmallWithIconRight: Story = {
  args: {
    size: "sm",
    icon: "right",
  },
};
