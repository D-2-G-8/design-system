import type { Meta, StoryObj } from "@storybook/react";
import { Dropdown } from "./Dropdown";

const meta: Meta<typeof Dropdown> = {
  title: "Components/Dropdown",
  component: Dropdown,
  args: {
    size: "m",
    type: "list",
    theme: "light",
  },
};
export default meta;

type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};

export const SizeMedium: Story = {
  args: {
    size: "m",
    type: "list",
  },
};

export const SizeSmall: Story = {
  args: {
    size: "s",
    type: "list",
  },
};

export const TypeCustom: Story = {
  args: {
    size: "m",
    type: "custom",
  },
};

export const TypeList: Story = {
  args: {
    size: "m",
    type: "list",
  },
};

export const SmallCustom: Story = {
  args: {
    size: "s",
    type: "custom",
  },
};
