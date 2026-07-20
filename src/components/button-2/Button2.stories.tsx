import type { Meta, StoryObj } from "@storybook/react";
import { Button2 } from "./Button2";

const meta: Meta<typeof Button2> = {
  title: "Components/Button2",
  component: Button2,
  args: { children: "Button" },
};
export default meta;

type Story = StoryObj<typeof Button2>;

export const Default: Story = {};

export const PrimaryLarge: Story = {
  args: {
    appearance: "primary",
    size: "large",
    icon: "none",
    theme: "light",
  },
};

export const PrimaryMedium: Story = {
  args: {
    appearance: "primary",
    size: "medium",
    icon: "none",
  },
};

export const PrimarySmall: Story = {
  args: {
    appearance: "primary",
    size: "small",
    icon: "none",
  },
};

export const PrimaryXSmall: Story = {
  args: {
    appearance: "primary",
    size: "xsmall",
    icon: "none",
  },
};

export const SecondaryMedium: Story = {
  args: {
    appearance: "secondary",
    size: "medium",
    icon: "none",
  },
};

export const SecondaryWithIconLeft: Story = {
  args: {
    appearance: "secondary",
    size: "medium",
    icon: "left",
  },
};

export const BlurSmall: Story = {
  args: {
    appearance: "blur",
    size: "small",
    icon: "none",
  },
};

export const BlurMedium: Story = {
  args: {
    appearance: "blur",
    size: "medium",
    icon: "none",
  },
};

export const WithIconLeft: Story = {
  args: {
    appearance: "primary",
    size: "medium",
    icon: "left",
  },
};

export const LightTheme: Story = {
  args: {
    appearance: "primary",
    size: "medium",
    theme: "light",
  },
};
