import type { Meta, StoryObj } from "@storybook/react";
import { HomeIndicator } from "./HomeIndicator";

const meta: Meta<typeof HomeIndicator> = {
  title: "Components/HomeIndicator",
  component: HomeIndicator,
  args: {
    device: "iPhone",
    orientation: "portrait",
  },
};
export default meta;

type Story = StoryObj<typeof HomeIndicator>;

export const Default: Story = {};
