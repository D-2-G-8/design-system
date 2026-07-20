import type { Meta, StoryObj } from "@storybook/react";
import { Trash } from "./Trash";

const meta: Meta<typeof Trash> = {
  title: "Components/Trash",
  component: Trash,
  args: { type: "basic" },
};
export default meta;

type Story = StoryObj<typeof Trash>;

export const Default: Story = {};
