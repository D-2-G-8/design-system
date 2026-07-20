import type { Meta, StoryObj } from "@storybook/react";
import { NoDrop } from "./NoDrop";

const meta: Meta<typeof NoDrop> = {
  title: "Components/NoDrop",
  component: NoDrop,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NoDrop>;

export const Default: Story = {};
