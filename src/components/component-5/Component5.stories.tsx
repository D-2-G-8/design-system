import type { Meta, StoryObj } from "@storybook/react";
import { Component5 } from "./Component5";

const meta: Meta<typeof Component5> = {
  title: "Components/Component5",
  component: Component5,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Component5>;

export const Default: Story = {};
