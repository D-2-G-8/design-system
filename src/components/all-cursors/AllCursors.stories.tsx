import type { Meta, StoryObj } from "@storybook/react";
import { AllCursors } from "./AllCursors";

const meta: Meta<typeof AllCursors> = {
  title: "Components/AllCursors",
  component: AllCursors,
  args: {},
};
export default meta;

type Story = StoryObj<typeof AllCursors>;

export const Default: Story = {};
