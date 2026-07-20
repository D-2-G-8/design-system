import type { Meta, StoryObj } from "@storybook/react";
import { CalendarTypes } from "./CalendarTypes";

const meta: Meta<typeof CalendarTypes> = {
  title: "Components/CalendarTypes",
  component: CalendarTypes,
  args: { type: "days" },
};
export default meta;

type Story = StoryObj<typeof CalendarTypes>;

export const Default: Story = {};
export const Days: Story = { args: { type: "days" } };
