import type { Meta, StoryObj } from "@storybook/react";
import { Stlleftnavigationparent } from "./Stlleftnavigationparent";

const meta: Meta<typeof Stlleftnavigationparent> = {
  title: "Components/Stlleftnavigationparent",
  component: Stlleftnavigationparent,
  args: { isOpen: false },
};
export default meta;

type Story = StoryObj<typeof Stlleftnavigationparent>;

export const Default: Story = {};
export const Close: Story = { args: { isOpen: false } };
export const Open: Story = { args: { isOpen: true } };
