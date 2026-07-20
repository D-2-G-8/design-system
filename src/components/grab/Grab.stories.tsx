import type { Meta, StoryObj } from "@storybook/react";
import { Grab } from "./Grab";

const meta: Meta<typeof Grab> = {
  title: "Components/Grab",
  component: Grab,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Grab>;

export const Default: Story = {};
