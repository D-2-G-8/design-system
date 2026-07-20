import type { Meta, StoryObj } from "@storybook/react";
import { Tab } from "./Tab";

const meta: Meta<typeof Tab> = {
  title: "Components/Tab",
  component: Tab,
  args: {
    children: "Tab Label",
    style: "fat",
    size: "lg",
    active: false,
    appearance: "primary",
  },
};
export default meta;

type Story = StoryObj<typeof Tab>;

export const Default: Story = {};

export const FatLargeActive: Story = {
  args: {
    style: "fat",
    size: "lg",
    active: true,
  },
};

export const FatMedium: Story = {
  args: {
    style: "fat",
    size: "md",
    active: false,
  },
};

export const FatSmall: Story = {
  args: {
    style: "fat",
    size: "sm",
    active: false,
  },
};

export const ThickLargeActive: Story = {
  args: {
    style: "thick",
    size: "lg",
    active: true,
  },
};

export const ThickMedium: Story = {
  args: {
    style: "thick",
    size: "md",
    active: false,
  },
};

export const ThickSmall: Story = {
  args: {
    style: "thick",
    size: "sm",
    active: false,
  },
};
