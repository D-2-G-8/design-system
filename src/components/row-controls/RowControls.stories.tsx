import type { Meta, StoryObj } from "@storybook/react";
import { RowControls } from "./RowControls";

const meta: Meta<typeof RowControls> = {
  title: "Components/RowControls",
  component: RowControls,
  args: { state: "default" },
};
export default meta;

type Story = StoryObj<typeof RowControls>;

export const Default: Story = {};
export const Hover: Story = { args: { state: "hover" } };
export const Active: Story = { args: { state: "active" } };
