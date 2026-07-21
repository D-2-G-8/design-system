import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  argTypes: {
    open: {
      description: "Controlled open state; pass together with onOpenChange to drive the accordion from the parent, or omit both to let the component manage its own open/closed state internally.",
      control: "boolean",
    },
    defaultOpen: {
      description: "Initial open state when uncontrolled; ignored if open is provided, defaults to false if omitted.",
      control: "boolean",
    },
    onOpenChange: {
      description: "Callback fired when the user toggles the accordion; receives the new open state and should be passed together with open for controlled usage.",
    },
    chevronPosition: {
      description: "Position of the chevron toggle icon; pass 'left' to place it before the title and icon, or 'right' to place it after, defaults to 'right'.",
      control: { type: "select" },
      options: ["left", "right"],
    },
    icon: {
      description: "Optional icon to display before the title; omit to hide the icon slot.",
    },
    title: {
      description: "Title text displayed in the accordion header, required and always visible.",
    },
    description: {
      description: "Optional description text displayed below the title in a lighter color; omit to hide the description.",
    },
    children: {
      description: "Content revealed when the accordion is opened; can be text, custom components, or any valid React children.",
    },
  },
  args: {
    title: "Title",
    description: "Description",
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <rect x="1" y="1" width="21.8" height="21.8" rx="4" fill="currentColor" />
      </svg>
    ),
    children: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const ChevronRight: Story = {
  args: {
    chevronPosition: "right",
  },
};

export const ChevronLeft: Story = {
  args: {
    chevronPosition: "left",
  },
};

export const OpenedChevronRight: Story = {
  args: {
    defaultOpen: true,
    chevronPosition: "right",
  },
};

export const OpenedChevronLeft: Story = {
  args: {
    defaultOpen: true,
    chevronPosition: "left",
  },
};

export const WithCustomContent: Story = {
  args: {
    defaultOpen: true,
    children: (
      <div style={{ display: "flex", flexDirection: "row", gap: "8px", padding: "16px", background: "#f5f5f5" }}>
        <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <rect x="1" y="3" width="22" height="18" rx="2" fill="currentColor" />
        </svg>
        <span style={{ fontSize: "18px", lineHeight: "24px", fontWeight: 500 }}>Swap me</span>
      </div>
    ),
  },
};

export const NoIcon: Story = {
  args: {
    icon: undefined,
  },
};

export const NoDescription: Story = {
  args: {
    description: undefined,
  },
};