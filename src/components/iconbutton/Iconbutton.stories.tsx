import type { Meta, StoryObj } from "@storybook/react";
import { Iconbutton } from "./Iconbutton";

const meta: Meta<typeof Iconbutton> = {
  title: "Components/Iconbutton",
  component: Iconbutton,
  args: {
    size: 32,
    appearance: "primary",
    theme: "dark",
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof Iconbutton>;

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

export const Size52: Story = {
  args: {
    size: 52,
  },
};

export const Primary: Story = {
  args: {
    appearance: "primary",
  },
};

export const Secondary: Story = {
  args: {
    appearance: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    appearance: "tertiary",
  },
};

export const Blur: Story = {
  args: {
    appearance: "blur",
  },
};

export const Light: Story = {
  args: {
    theme: "light",
  },
};

export const Dark: Story = {
  args: {
    theme: "dark",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const PrimaryLarge: Story = {
  args: {
    size: 52,
    appearance: "primary",
  },
};

export const SecondarySmall: Story = {
  args: {
    size: 24,
    appearance: "secondary",
  },
};

export const TertiaryLight: Story = {
  args: {
    appearance: "tertiary",
    theme: "light",
  },
};

export const BlurDisabled: Story = {
  args: {
    appearance: "blur",
    disabled: true,
  },
};
