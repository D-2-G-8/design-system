import type { Meta, StoryObj } from "@storybook/react";
import { DropdownItem } from "./DropdownItem";

const meta: Meta<typeof DropdownItem> = {
  title: "Components/DropdownItem",
  component: DropdownItem,
  args: {
    size: "m",
    selected: false,
    labelMedium: false,
    disabled: false,
    children: "Dropdown Item",
  },
};
export default meta;

type Story = StoryObj<typeof DropdownItem>;

export const Default: Story = {};

export const SizeSmall: Story = {
  args: {
    size: "s",
  },
};

export const SizeMedium: Story = {
  args: {
    size: "m",
  },
};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const SelectedSmall: Story = {
  args: {
    size: "s",
    selected: true,
  },
};

export const WithLabelMedium: Story = {
  args: {
    labelMedium: true,
  },
};

export const SmallWithLabelMedium: Story = {
  args: {
    size: "s",
    labelMedium: true,
  },
};

export const SelectedWithLabelMedium: Story = {
  args: {
    selected: true,
    labelMedium: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledSelected: Story = {
  args: {
    disabled: true,
    selected: true,
  },
};

export const DisabledSmall: Story = {
  args: {
    size: "s",
    disabled: true,
  },
};
