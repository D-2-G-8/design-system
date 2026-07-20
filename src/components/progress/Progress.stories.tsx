import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {};
