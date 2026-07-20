import type { Meta, StoryObj } from "@storybook/react";
import { StatusIndicator } from "./StatusIndicator";

const meta: Meta<typeof StatusIndicator> = {
  title: "Components/StatusIndicator",
  component: StatusIndicator,
  args: {
    size: "xs",
    appearance: "active",
    type: "status1",
  },
};
export default meta;

type Story = StoryObj<typeof StatusIndicator>;

export const Default: Story = {};

export const Negative: Story = {
  args: {
    appearance: "negative",
  },
};

export const Positive: Story = {
  args: {
    appearance: "positive",
  },
};

export const Warning: Story = {
  args: {
    appearance: "warning",
  },
};

export const Active: Story = {
  args: {
    appearance: "active",
  },
};

export const Passive: Story = {
  args: {
    appearance: "passive",
  },
};

export const Status2: Story = {
  args: {
    type: "status2",
  },
};

export const Status3: Story = {
  args: {
    type: "status3",
  },
};

export const NegativeStatus2: Story = {
  args: {
    appearance: "negative",
    type: "status2",
  },
};

export const PositiveStatus3: Story = {
  args: {
    appearance: "positive",
    type: "status3",
  },
};

export const WarningStatus2: Story = {
  args: {
    appearance: "warning",
    type: "status2",
  },
};
