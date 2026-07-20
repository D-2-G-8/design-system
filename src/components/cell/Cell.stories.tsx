import type { Meta, StoryObj } from "@storybook/react";
import { Cell } from "./Cell";

const meta: Meta<typeof Cell> = {
  title: "Components/Cell",
  component: Cell,
  args: {
    type: "default",
    theme: "light",
    size: "m",
  },
};
export default meta;

type Story = StoryObj<typeof Cell>;

export const Default: Story = {};

export const Header: Story = {
  args: {
    type: "header",
  },
};

export const SizeSmall: Story = {
  args: {
    size: "s",
  },
};

export const HeaderSmall: Story = {
  args: {
    type: "header",
    size: "s",
  },
};
