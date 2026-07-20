import type { Meta, StoryObj } from "@storybook/react";
import { Component3 } from "./Component3";

const meta: Meta<typeof Component3> = {
  title: "Components/Component3",
  component: Component3,
  args: { property1: "мини" },
};
export default meta;

type Story = StoryObj<typeof Component3>;

export const Default: Story = {};
export const Mini: Story = { args: { property1: "мини" } };
