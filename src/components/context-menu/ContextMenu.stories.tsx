import type { Meta, StoryObj } from "@storybook/react";
import { ContextMenu } from "./ContextMenu";

const meta: Meta<typeof ContextMenu> = {
  title: "Components/ContextMenu",
  component: ContextMenu,
  args: {},
};
export default meta;

type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {};
