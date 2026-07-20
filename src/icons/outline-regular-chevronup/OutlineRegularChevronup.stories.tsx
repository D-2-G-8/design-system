import type { Meta, StoryObj } from "@storybook/react";
import { OutlineRegularChevronup as Component } from "./OutlineRegularChevronup";

const meta: Meta<typeof Component> = {
  title: "Icons/OutlineRegularChevronup",
  component: Component,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};
