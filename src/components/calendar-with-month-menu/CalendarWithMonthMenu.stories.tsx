import type { Meta, StoryObj } from "@storybook/react";
import { CalendarWithMonthMenu } from "./CalendarWithMonthMenu";

const meta: Meta<typeof CalendarWithMonthMenu> = {
  title: "Components/CalendarWithMonthMenu",
  component: CalendarWithMonthMenu,
  args: {},
};
export default meta;

type Story = StoryObj<typeof CalendarWithMonthMenu>;

export const Default: Story = {};
