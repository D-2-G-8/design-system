import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  args: {
    size: "m",
    text: "min",
    theme: "light",
    pressed: false,
  },
};
export default meta;

type Story = StoryObj<typeof Card>;

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

export const TextMax: Story = {
  args: {
    text: "max",
  },
};

export const Pressed: Story = {
  args: {
    pressed: true,
  },
};

export const SmallPressed: Story = {
  args: {
    size: "s",
    pressed: true,
  },
};

export const MaxTextPressed: Story = {
  args: {
    text: "max",
    pressed: true,
  },
};
