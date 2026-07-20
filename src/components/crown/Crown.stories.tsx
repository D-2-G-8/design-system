import type { Meta, StoryObj } from "@storybook/react";
import { Crown } from "./Crown";

const meta: Meta<typeof Crown> = {
  title: "Components/Crown",
  component: Crown,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Crown>;

export const Default: Story = {};
