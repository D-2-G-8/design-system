import type { Meta, StoryObj } from "@storybook/react";
import { Accessibility } from "./Accessibility";

const meta: Meta<typeof Accessibility> = {
  title: "Components/Accessibility",
  component: Accessibility,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Accessibility>;

export const Default: Story = {};
