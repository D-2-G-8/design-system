import type { Meta, StoryObj } from "@storybook/react";
import { CrossSynleftnavigationparent } from "./CrossSynleftnavigationparent";

const meta: Meta<typeof CrossSynleftnavigationparent> = {
  title: "Components/CrossSynleftnavigationparent",
  component: CrossSynleftnavigationparent,
  args: { isOpen: false },
};
export default meta;

type Story = StoryObj<typeof CrossSynleftnavigationparent>;

export const Default: Story = {};
export const Open: Story = { args: { isOpen: true } };
export const Close: Story = { args: { isOpen: false } };
