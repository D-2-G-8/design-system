import type { Meta, StoryObj } from "@storybook/react";
import { Day } from "./Day";

const meta: Meta<typeof Day> = {
  title: "Components/Day",
  component: Day,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Day>;

export const Default: Story = {};
