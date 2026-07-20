import type { Meta, StoryObj } from "@storybook/react";
import { Sizing } from "./Sizing";

const meta: Meta<typeof Sizing> = {
  title: "Components/Sizing",
  component: Sizing,
  args: { size: "m" },
};
export default meta;

type Story = StoryObj<typeof Sizing>;

export const Default: Story = {};
export const SizeM: Story = { args: { size: "m" } };
export const SizeL: Story = { args: { size: "l" } };
