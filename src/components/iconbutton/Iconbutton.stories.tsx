import type { Meta, StoryObj } from "@storybook/react";
import { Iconbutton as Component } from "./Iconbutton";

const PlusIcon = (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof Component> = {
  title: "Components/Iconbutton",
  component: Component,
  args: {
    icon: PlusIcon,
    size: "40px",
    appearance: "primary",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["24px", "32px", "40px", "52px"],
    },
    appearance: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
    },
    tooltipPosition: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Primary52px: Story = {
  args: {
    size: "52px",
    appearance: "primary",
  },
};

export const Primary40px: Story = {
  args: {
    size: "40px",
    appearance: "primary",
  },
};

export const Primary32px: Story = {
  args: {
    size: "32px",
    appearance: "primary",
  },
};

export const Primary24px: Story = {
  args: {
    size: "24px",
    appearance: "primary",
  },
};

export const Secondary52px: Story = {
  args: {
    size: "52px",
    appearance: "secondary",
  },
};

export const Secondary40px: Story = {
  args: {
    size: "40px",
    appearance: "secondary",
  },
};

export const Secondary32px: Story = {
  args: {
    size: "32px",
    appearance: "secondary",
  },
};

export const Secondary24px: Story = {
  args: {
    size: "24px",
    appearance: "secondary",
  },
};

export const Tertiary52px: Story = {
  args: {
    size: "52px",
    appearance: "tertiary",
  },
};

export const Tertiary40px: Story = {
  args: {
    size: "40px",
    appearance: "tertiary",
  },
};

export const Tertiary32px: Story = {
  args: {
    size: "32px",
    appearance: "tertiary",
  },
};

export const Tertiary24px: Story = {
  args: {
    size: "24px",
    appearance: "tertiary",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    appearance: "primary",
    size: "40px",
  },
};

export const WithBadge: Story = {
  args: {
    badgeCount: 5,
    size: "52px",
    appearance: "primary",
  },
};

export const WithTooltip: Story = {
  args: {
    tooltip: "Tooltip Text",
    tooltipPosition: "top",
    size: "40px",
    appearance: "primary",
  },
};

export const WithTooltipBottom: Story = {
  args: {
    tooltip: "Tooltip Text",
    tooltipPosition: "bottom",
    size: "40px",
    appearance: "secondary",
  },
};

export const SecondaryDisabled: Story = {
  args: {
    disabled: true,
    appearance: "secondary",
    size: "40px",
  },
};

export const TertiaryDisabled: Story = {
  args: {
    disabled: true,
    appearance: "tertiary",
    size: "40px",
  },
};
