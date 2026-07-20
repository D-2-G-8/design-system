import type { Meta, StoryObj } from "@storybook/react";
import { DropdownColV11 } from "./DropdownColV11";

const meta: Meta<typeof DropdownColV11> = {
  title: "Components/DropdownColV11",
  component: DropdownColV11,
  args: {
    presets: false,
    filterByValue: false,
    state: "default",
  },
};
export default meta;

type Story = StoryObj<typeof DropdownColV11>;

export const Default: Story = {};

export const PresetsOff: Story = {
  args: {
    presets: false,
    filterByValue: false,
    state: "default",
  },
};

export const PresetsOn: Story = {
  args: {
    presets: true,
    filterByValue: false,
    state: "default",
  },
};

export const FilterByValueOn: Story = {
  args: {
    presets: false,
    filterByValue: true,
    state: "default",
  },
};

export const FilterState: Story = {
  args: {
    presets: false,
    filterByValue: false,
    state: "filter",
  },
};

export const PresetState: Story = {
  args: {
    presets: true,
    filterByValue: false,
    state: "preset",
  },
};

export const PresetsOnWithFilter: Story = {
  args: {
    presets: true,
    filterByValue: false,
    state: "filter",
  },
};

export const FilterByValueWithFilter: Story = {
  args: {
    presets: false,
    filterByValue: true,
    state: "filter",
  },
};
