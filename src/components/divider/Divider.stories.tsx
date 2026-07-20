import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "./Divider";

const meta: Meta<typeof Divider> = {
  title: "Components/Divider",
  component: Divider,
  args: { size: "m" },
};
export default meta;

type Story = StoryObj<typeof Divider>;

export const Default: Story = {};
export const Small: Story = { args: { size: "s" } };
export const Medium: Story = { args: { size: "m" } };
