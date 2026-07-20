import type { Meta, StoryObj } from "@storybook/react";
import { Copy } from "./Copy";

const meta: Meta<typeof Copy> = {
  title: "Components/Copy",
  component: Copy,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Copy>;

export const Default: Story = {};
