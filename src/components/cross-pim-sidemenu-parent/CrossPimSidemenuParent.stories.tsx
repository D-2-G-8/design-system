import type { Meta, StoryObj } from "@storybook/react";
import { CrossPimSidemenuParent } from "./CrossPimSidemenuParent";

const meta: Meta<typeof CrossPimSidemenuParent> = {
  title: "Components/CrossPimSidemenuParent",
  component: CrossPimSidemenuParent,
  args: {},
};
export default meta;

type Story = StoryObj<typeof CrossPimSidemenuParent>;

export const Default: Story = {};
export const Close: Story = {};
export const Open: Story = {};
