import type { Meta, StoryObj } from "@storybook/react";
import { Tab40 } from "./Tab40";

const meta: Meta<typeof Tab40> = {
  title: "Components/Tab40",
  component: Tab40,
  args: {
    type: "text32",
    isActive: false,
    children: "Tab Label",
  },
};
export default meta;

type Story = StoryObj<typeof Tab40>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Text32Default: Story = {
  args: {
    type: "text32",
    isActive: false,
  },
};

export const Text32Active: Story = {
  args: {
    type: "text32",
    isActive: true,
  },
};
