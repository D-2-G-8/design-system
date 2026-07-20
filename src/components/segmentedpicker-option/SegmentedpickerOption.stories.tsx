import type { Meta, StoryObj } from "@storybook/react";
import { SegmentedpickerOption } from "./SegmentedpickerOption";

const meta: Meta<typeof SegmentedpickerOption> = {
  title: "Components/SegmentedpickerOption",
  component: SegmentedpickerOption,
  args: {
    selected: false,
    icon: false,
    darkMode: false,
  },
};
export default meta;

type Story = StoryObj<typeof SegmentedpickerOption>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const WithIcon: Story = {
  args: {
    icon: true,
  },
};

export const SelectedWithIcon: Story = {
  args: {
    selected: true,
    icon: true,
  },
};

export const DarkMode: Story = {
  args: {
    darkMode: true,
  },
};

export const DarkModeSelected: Story = {
  args: {
    darkMode: true,
    selected: true,
  },
};

export const DarkModeWithIcon: Story = {
  args: {
    darkMode: true,
    icon: true,
  },
};

export const DarkModeSelectedWithIcon: Story = {
  args: {
    darkMode: true,
    selected: true,
    icon: true,
  },
};
