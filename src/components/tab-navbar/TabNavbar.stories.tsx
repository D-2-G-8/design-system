import type { Meta, StoryObj } from "@storybook/react";
import { TabNavbar } from "./TabNavbar";

const meta: Meta<typeof TabNavbar> = {
  title: "Components/TabNavbar",
  component: TabNavbar,
  args: {
    device: "desktop",
    showCounter: true,
  },
};
export default meta;

type Story = StoryObj<typeof TabNavbar>;

export const Default: Story = {};

export const Desktop: Story = {
  args: {
    device: "desktop",
    showCounter: true,
  },
};

export const DesktopNoCounter: Story = {
  args: {
    device: "desktop",
    showCounter: false,
  },
};

export const Mobile: Story = {
  args: {
    device: "mobile",
    showCounter: true,
  },
};

export const MobileNoCounter: Story = {
  args: {
    device: "mobile",
    showCounter: false,
  },
};
