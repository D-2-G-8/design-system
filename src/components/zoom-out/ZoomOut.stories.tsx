import type { Meta, StoryObj } from "@storybook/react";
import { ZoomOut } from "./ZoomOut";

const meta: Meta<typeof ZoomOut> = {
  title: "Components/ZoomOut",
  component: ZoomOut,
  args: {},
};
export default meta;

type Story = StoryObj<typeof ZoomOut>;

export const Default: Story = {};
