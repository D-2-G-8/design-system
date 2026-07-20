import type { Meta, StoryObj } from "@storybook/react";
import { ColResize } from "./ColResize";

const meta: Meta<typeof ColResize> = {
  title: "Components/ColResize",
  component: ColResize,
  args: {
    hover: false,
  },
};
export default meta;

type Story = StoryObj<typeof ColResize>;

export const Default: Story = {};
export const Hover: Story = {
  args: {
    hover: true,
  },
};
