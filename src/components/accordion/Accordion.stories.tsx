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
