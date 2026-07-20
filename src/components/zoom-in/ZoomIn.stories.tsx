import type { Meta, StoryObj } from "@storybook/react";
import { ZoomIn } from "./ZoomIn";

const meta: Meta<typeof ZoomIn> = {
  title: "Components/ZoomIn",
  component: ZoomIn,
  args: {},
};
export default meta;

type Story = StoryObj<typeof ZoomIn>;

export const Default: Story = {};
