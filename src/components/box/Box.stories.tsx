import type { Meta, StoryObj } from "@storybook/react";
import { Box } from "./Box";

const meta: Meta<typeof Box> = {
  title: "Components/Box",
  component: Box,
  args: { children: "Box content" },
};
export default meta;

type Story = StoryObj<typeof Box>;

export const Default: Story = {};
