import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta: Meta<typeof Chip> = {
  title: "Components/Chip",
  component: Chip,
  args: {
    size: "40",
    type: "default",
    appearance: "default",
    active: false,
    children: "Chip",
  },
};
export default meta;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {};

export const Active: Story = {
  args: {
    active: true,
  },
};

export const Size32: Story = {
  args: {
    size: "32",
  },
};

export const Menu: Story = {
  args: {
    type: "menu",
  },
};

export const MenuActive: Story = {
  args: {
    type: "menu",
    active: true,
  },
};

export const Editable: Story = {
  args: {
    type: "editable",
  },
};

export const EditableActive: Story = {
  args: {
    type: "editable",
    active: true,
  },
};

export const Small: Story = {
  args: {
    size: "32",
    type: "menu",
  },
};
