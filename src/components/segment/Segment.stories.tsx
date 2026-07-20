import type { Meta, StoryObj } from "@storybook/react";
import { Segment } from "./Segment";

const meta: Meta<typeof Segment> = {
  title: "Components/Segment",
  component: Segment,
  args: {
    active: false,
    size: "md",
  },
};
export default meta;

type Story = StoryObj<typeof Segment>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
  },
};

export const SmallActive: Story = {
  args: {
    size: "sm",
    active: true,
  },
};
