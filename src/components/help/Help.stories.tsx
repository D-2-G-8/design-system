import type { Meta, StoryObj } from "@storybook/react";
import { Help } from "./Help";

const meta: Meta<typeof Help> = {
  title: "Components/Help",
  component: Help,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Help>;

export const Default: Story = {};
