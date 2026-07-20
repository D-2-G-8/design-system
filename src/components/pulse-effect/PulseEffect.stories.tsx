import type { Meta, StoryObj } from "@storybook/react";
import { PulseEffect } from "./PulseEffect";

const meta: Meta<typeof PulseEffect> = {
  title: "Components/PulseEffect",
  component: PulseEffect,
  args: {
    variant: "default",
  },
};
export default meta;

type Story = StoryObj<typeof PulseEffect>;

export const Default: Story = {};
export const Variant2: Story = {
  args: {
    variant: "variant2",
  },
};
export const Variant3: Story = {
  args: {
    variant: "variant3",
  },
};
