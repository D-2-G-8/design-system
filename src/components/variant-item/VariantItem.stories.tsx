import type { Meta, StoryObj } from "@storybook/react";
import { VariantItem } from "./VariantItem";

const meta: Meta<typeof VariantItem> = {
  title: "Components/VariantItem",
  component: VariantItem,
  args: { type: "instance" },
};
export default meta;

type Story = StoryObj<typeof VariantItem>;

export const Default: Story = {};
export const Instance: Story = { args: { type: "instance" } };
export const Boolean: Story = { args: { type: "boolean" } };
export const Text: Story = { args: { type: "text" } };
