import type { Meta, StoryObj } from "@storybook/react";
import { Button as Component } from "./Button";

const meta: Meta<typeof Component> = {
  title: "Components/Button",
  component: Component,
  args: { 
    children: "Button text",
    size: "40px",
    appearance: "primary",
    disabled: false,
  },
  argTypes: {
    size: {
      description: "Height of the button in pixels, controlling padding, font size, and icon dimensions; defaults to '40px' for standard UI density.",
      control: { type: "select" },
      options: ["24px", "32px", "40px", "52px"],
    },
    appearance: {
      description: "Visual style variant controlling background and text colors; 'primary' is solid black, 'secondary' is light gray, 'tertiary' is transparent with hover states; defaults to 'primary'.",
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
    },
    disabled: {
      description: "When true, renders the button in a visually muted state and prevents interaction; defaults to false.",
      control: "boolean",
    },
    toggled: {
      description: "Controlled toggle state for tertiary buttons only; when true, applies a toggled background color to indicate the button is in an active/selected state; ignored for primary and secondary appearances.",
      control: "boolean",
    },
    defaultToggled: {
      description: "Initial toggle state when uncontrolled; only applies to tertiary appearance buttons; ignored if 'toggled' is provided or if appearance is primary/secondary.",
      control: "boolean",
    },
    onToggledChange: {
      description: "Callback fired when the toggle state changes in tertiary appearance buttons; receives the new toggled value; must be provided together with 'toggled' for controlled behavior, or omit both for uncontrolled behavior.",
    },
    children: {
      description: "Button label text or content; typically a string but supports any renderable content including icons and badges.",
    },
    description: {
      description: "Optional secondary description text; only rendered for size='52px'; appears below the main button text with smaller, lighter styling.",
      control: "text",
    },
    startIcon: {
      description: "Optional icon or component rendered before the label; pass a design-system icon component instance.",
    },
    endIcon: {
      description: "Optional icon or component rendered after the label; pass a design-system icon component instance.",
    },
    badge: {
      description: "Optional badge component rendered at the end of the button; pass a BadgeCount component instance for count indicators. Badge size should match button size: use size=\"20px\" for button size='52px', size=\"16px\" for other sizes.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

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

export const Size52: Story = {
  args: {
    size: "52px",
  },
};

export const Size52WithDescription: Story = {
  args: {
    size: "52px",
    description: "Desc",
  },
};

export const Size32: Story = {
  args: {
    size: "32px",
  },
};

export const Size24: Story = {
  args: {
    size: "24px",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithStartIcon: Story = {
  args: {
    startIcon: (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
  },
};

export const WithEndIcon: Story = {
  args: {
    endIcon: (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
  },
};

export const WithBothIcons: Story = {
  args: {
    startIcon: (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
    endIcon: (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    ),
  },
};

export const TertiaryToggled: Story = {
  args: {
    appearance: "tertiary",
    defaultToggled: true,
  },
};

export const PrimaryHover: Story = {
  args: {
    appearance: "primary",
  },
  parameters: {
    pseudo: { hover: true },
  },
};

export const SecondaryHover: Story = {
  args: {
    appearance: "secondary",
  },
  parameters: {
    pseudo: { hover: true },
  },
};

export const TertiaryHover: Story = {
  args: {
    appearance: "tertiary",
  },
  parameters: {
    pseudo: { hover: true },
  },
};