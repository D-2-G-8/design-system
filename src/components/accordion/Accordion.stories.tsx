import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  args: {
    opened: false,
    chevronPosition: "right",
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const ChevronRight: Story = {
  args: {
    opened: false,
    chevronPosition: "right",
  },
};

export const ChevronLeft: Story = {
  args: {
    opened: false,
    chevronPosition: "left",
  },
};

export const OpenedChevronRight: Story = {
  args: {
    opened: true,
    chevronPosition: "right",
  },
};

export const OpenedChevronLeft: Story = {
  args: {
    opened: true,
    chevronPosition: "left",
  },
};
