import type { Meta, StoryObj } from "@storybook/react";
import { Component4 } from "./Component4";

const meta: Meta<typeof Component4> = {
  title: "Components/Component4",
  component: Component4,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Component4>;

export const Default: Story = {};
