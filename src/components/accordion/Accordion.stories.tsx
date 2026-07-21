import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";
import { useState } from "react";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  args: {
    opened: false,
    chevronPosition: "right",
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M3 10h18M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: "Accordion Title",
    description: "",
    content: null,
    onToggle: () => {},
  },
  argTypes: {
    chevronPosition: {
      control: "radio",
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
    description: "Lorem ipsum dolor sit amet, consectetur ",
    content: (
      <div style={{ display: "flex", gap: "8px", background: "#f5f5f5", padding: "20px" }}>
        <div style={{ width: "24px", height: "24px", background: "#ddd", borderRadius: "4px" }} />
        <span style={{ fontFamily: "Roboto", fontWeight: 500, fontSize: "18px", lineHeight: "24px" }}>
          Swap me
        </span>
      </div>
    ),
  },
};

export const OpenedChevronLeft: Story = {
  args: {
    opened: true,
    chevronPosition: "left",
    description: "Lorem ipsum dolor sit amet, consectetur ",
    content: (
      <div style={{ display: "flex", gap: "8px", background: "#f5f5f5", padding: "20px" }}>
        <div style={{ width: "24px", height: "24px", background: "#ddd", borderRadius: "4px" }} />
        <span style={{ fontFamily: "Roboto", fontWeight: 500, fontSize: "18px", lineHeight: "24px" }}>
          Swap me
        </span>
      </div>
    ),
  },
};
