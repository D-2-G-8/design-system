import type { Meta, StoryObj } from "@storybook/react";
import { Damleftnavigationparent } from "./Damleftnavigationparent";

const meta: Meta<typeof Damleftnavigationparent> = {
  title: "Components/Damleftnavigationparent",
  component: Damleftnavigationparent,
  args: { isOpen: false },
};
export default meta;

type Story = StoryObj<typeof Damleftnavigationparent>;

export const Default: Story = {};
export const Close: Story = { args: { isOpen: false } };
export const Open: Story = { args: { isOpen: true } };
