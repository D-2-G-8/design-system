import type { Meta, StoryObj } from "@storybook/react";
import { DatePickerDays } from "./DatePickerDays";

const meta: Meta<typeof DatePickerDays> = {
  title: "Components/DatePickerDays",
  component: DatePickerDays,
  args: {
    disabled: false,
    isCurrent: false,
    isActive: false,
    isEmpty: false,
  },
};
export default meta;

type Story = StoryObj<typeof DatePickerDays>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Current: Story = {
  args: {
    isCurrent: true,
  },
};

export const Active: Story = {
  args: {
    isActive: true,
  },
};

export const Empty: Story = {
  args: {
    isEmpty: true,
  },
};

export const ActiveAndCurrent: Story = {
  args: {
    isActive: true,
    isCurrent: true,
  },
};
