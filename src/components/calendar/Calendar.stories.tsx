import type { Meta, StoryObj } from "@storybook/react";
import { Calendar } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Components/Calendar",
  component: Calendar,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const Default: Story = {};
