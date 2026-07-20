import type { Meta, StoryObj } from "@storybook/react";
import { Background } from "./Background";

const meta: Meta<typeof Background> = {
  title: "Components/Background",
  component: Background,
  args: {
    mode: "light",
    style: "default",
    type: "default",
  },
};
export default meta;

type Story = StoryObj<typeof Background>;

export const Default: Story = {};

export const Dark: Story = {
  args: {
    mode: "dark",
  },
};
