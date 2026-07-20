import type { Meta, StoryObj } from "@storybook/react";
import { AndroidStatusBar } from "./AndroidStatusBar";

const meta: Meta<typeof AndroidStatusBar> = {
  title: "Components/AndroidStatusBar",
  component: AndroidStatusBar,
  args: {},
};
export default meta;

type Story = StoryObj<typeof AndroidStatusBar>;

export const Default: Story = {};
