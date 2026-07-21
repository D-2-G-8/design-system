import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  args: {
    opened: false,
    chevronPosition: "right",
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="4" rx="1" fill="currentColor" />
        <rect x="3" y="14" width="18" height="4" rx="1" fill="currentColor" />
      </svg>
    ),
    title: "Accordion Title",
    description: "",
    children: (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ margin: 0, fontFamily: "Roboto Flex", fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "20px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <div style={{ width: "24px", height: "24px", backgroundColor: "#ddd", borderRadius: "4px" }} />
          <span style={{ fontFamily: "Roboto", fontWeight: 500, fontSize: "18px", lineHeight: "24px" }}>Swap me</span>
        </div>
      </div>
    ),
  },
  argTypes: {
    chevronPosition: {
      control: "select",
      options: ["left", "right"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const ChevronLeft: Story = {
  args: {
    chevronPosition: "left",
  },
};

export const Opened: Story = {
  args: {
    opened: true,
  },
};

export const OpenedChevronLeft: Story = {
  args: {
    opened: true,
    chevronPosition: "left",
  },
};
