import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDesktop } from "./CalendarDesktop";

const meta: Meta<typeof CalendarDesktop> = {
  title: "Components/CalendarDesktop",
  component: CalendarDesktop,
  args: { types: "double" },
};
export default meta;

type Story = StoryObj<typeof CalendarDesktop>;

export const Default: Story = {};
export const Double: Story = { args: { types: "double" } };
