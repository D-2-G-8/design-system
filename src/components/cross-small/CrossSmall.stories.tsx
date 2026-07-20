import type { Meta, StoryObj } from "@storybook/react";
import { CrossSmall } from "./CrossSmall";

const meta: Meta<typeof CrossSmall> = {
  title: "Components/CrossSmall",
  component: CrossSmall,
  args: {},
};
export default meta;

type Story = StoryObj<typeof CrossSmall>;

export const Default: Story = {};
