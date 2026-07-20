import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./Component";

const meta: Meta<typeof Component> = {
  title: "Components/Component",
  component: Component,
  args: { variant: "mini" },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
export const Mini: Story = { args: { variant: "mini" } };
