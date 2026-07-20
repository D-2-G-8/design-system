import type { Meta, StoryObj } from "@storybook/react";
import { Rpcleftnavigationparent } from "./Rpcleftnavigationparent";

const meta: Meta<typeof Rpcleftnavigationparent> = {
  title: "Components/Rpcleftnavigationparent",
  component: Rpcleftnavigationparent,
  args: { isOpen: false },
};
export default meta;

type Story = StoryObj<typeof Rpcleftnavigationparent>;

export const Default: Story = {};
export const Close: Story = { args: { isOpen: false } };
export const Open: Story = { args: { isOpen: true } };
