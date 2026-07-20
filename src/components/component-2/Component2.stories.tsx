import type { Meta, StoryObj } from "@storybook/react";
import { Component2 } from "./Component2";

const meta: Meta<typeof Component2> = {
  title: "Components/Component2",
  component: Component2,
  args: { property1: "мини" },
};
export default meta;

type Story = StoryObj<typeof Component2>;

export const Default: Story = {};
export const Mini: Story = { args: { property1: "мини" } };
