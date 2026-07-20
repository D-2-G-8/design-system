import type { Meta, StoryObj } from "@storybook/react";
import { SwResize } from "./SwResize";

const meta: Meta<typeof SwResize> = {
  title: "Components/SwResize",
  component: SwResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof SwResize>;

export const Default: Story = {};
