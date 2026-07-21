import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  args: {
    opened: false,
    chevronPosition: "right",
    title: "Accordion Title",
    description: "",
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <rect x={3} y={6} width={18} height={3} fill="currentColor" />
        <rect x={3} y={11} width={18} height={3} fill="currentColor" />
        <rect x={3} y={16} width={18} height={3} fill="currentColor" />
      </svg>
    ),
    content: (
      <div style={{ padding: "0", display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ margin: 0, fontFamily: "Roboto Flex", fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div style={{ display: "flex", flexDirection: "row", gap: "8px", padding: "20px", backgroundColor: "#f5f5f5" }}>
          <div style={{ width: "24px", height: "24px", backgroundColor: "#ddd" }} />
          <span style={{ fontFamily: "Roboto", fontWeight: 500, fontSize: "18px", lineHeight: "24px" }}>Swap me</span>
        </div>
      </div>
    ),
    onToggle: () => {},
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
