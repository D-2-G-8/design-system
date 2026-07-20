import type { Meta, StoryObj } from "@storybook/react";
import { SResize } from "./SResize";

const meta: Meta<typeof SResize> = {
  title: "Components/SResize",
  component: SResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof SResize>;

export const Default: Story = {};
