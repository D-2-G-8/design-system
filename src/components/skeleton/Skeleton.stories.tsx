import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  args: {
    view: "text",
    lines: 2,
  },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {};

export const TextSingleLine: Story = {
  args: {
    view: "text",
    lines: 1,
  },
};

export const TextMultipleLines: Story = {
  args: {
    view: "text",
    lines: 3,
  },
};

export const ComponentSingleLine: Story = {
  args: {
    view: "component",
    lines: 1,
  },
};

export const ComponentMultipleLines: Story = {
  args: {
    view: "component",
    lines: 2,
  },
};
