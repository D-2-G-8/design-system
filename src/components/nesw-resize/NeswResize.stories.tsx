import type { Meta, StoryObj } from "@storybook/react";
import { NeswResize } from "./NeswResize";

const meta: Meta<typeof NeswResize> = {
  title: "Components/NeswResize",
  component: NeswResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NeswResize>;

export const Default: Story = {};
