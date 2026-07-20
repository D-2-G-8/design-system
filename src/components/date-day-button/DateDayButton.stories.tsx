import type { Meta, StoryObj } from "@storybook/react";
import { DateDayButton } from "./DateDayButton";

const meta: Meta<typeof DateDayButton> = {
  title: "Components/DateDayButton",
  component: DateDayButton,
  args: {
    checked: false,
    interval: null,
    isNextMonth: false,
    children: "15",
  },
};
export default meta;

type Story = StoryObj<typeof DateDayButton>;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const NextMonth: Story = {
  args: {
    isNextMonth: true,
  },
};

export const IntervalStart: Story = {
  args: {
    interval: "start",
  },
};

export const IntervalBetween: Story = {
  args: {
    interval: "between",
  },
};

export const IntervalEnd: Story = {
  args: {
    interval: "end",
  },
};

export const CheckedIntervalStart: Story = {
  args: {
    checked: true,
    interval: "start",
  },
};

export const CheckedIntervalEnd: Story = {
  args: {
    checked: true,
    interval: "end",
  },
};

export const NextMonthChecked: Story = {
  args: {
    isNextMonth: true,
    checked: true,
  },
};
