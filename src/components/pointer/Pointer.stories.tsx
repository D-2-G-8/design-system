import type { Meta, StoryObj } from "@storybook/react";
import { Pointer } from "./Pointer";

const meta: Meta<typeof Pointer> = {
  title: "Components/Pointer",
  component: Pointer,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Pointer>;

export const Default: Story = {};
