import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown2 } from "./Dropdown2";

const meta: Meta<typeof Dropdown2> = {
  title: "Components/Dropdown2",
  component: Dropdown2,
  args: {
    appearance: "primary",
    size: "medium",
    theme: "light",
    device: "mobile",
    state: "passive",
    isEmpty: false,
    hasTooltip: false,
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown2>;

export const Default: Story = {};

export const Large: Story = {
  args: {
    size: "large",
  },
};

export const FocusedEmpty: Story = {
  args: {
    state: "focused",
    isEmpty: true,
  },
};

export const FocusedWithContent: Story = {
  args: {
    state: "focused",
    isEmpty: false,
  },
};

export const LargeFocused: Story = {
  args: {
    size: "large",
    state: "focused",
  },
};

export const WithTooltip: Story = {
  args: {
    hasTooltip: true,
  },
};
