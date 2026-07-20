import type { Meta, StoryObj } from "@storybook/react";
import { NeResize } from "./NeResize";

const meta: Meta<typeof NeResize> = {
  title: "Components/NeResize",
  component: NeResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NeResize>;

export const Default: Story = {};
