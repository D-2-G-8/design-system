import type { Meta, StoryObj } from "@storybook/react";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  args: {
    theme: "light",
    appearance: "secondary",
    size: "md",
    disabled: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 5V15M5 10H15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    ariaLabel: "Icon button",
  },
};
export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {};

export const SecondaryLight: Story = {
  args: {
    theme: "light",
    appearance: "secondary",
    size: "md",
  },
};

export const SecondaryDark: Story = {
  args: {
    theme: "dark",
    appearance: "secondary",
    size: "md",
  },
};

export const BlurLight: Story = {
  args: {
    theme: "light",
    appearance: "blur",
    size: "md",
  },
};

export const BlurDark: Story = {
  args: {
    theme: "dark",
    appearance: "blur",
    size: "md",
  },
};

export const SizeXSmall: Story = {
  args: {
    size: "xs",
  },
};

export const SizeSmall: Story = {
  args: {
    size: "sm",
  },
};

export const SizeMedium: Story = {
  args: {
    size: "md",
  },
};

export const SizeLarge: Story = {
  args: {
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledBlur: Story = {
  args: {
    appearance: "blur",
    disabled: true,
  },
};
