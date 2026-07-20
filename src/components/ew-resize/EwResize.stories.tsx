import type { Meta, StoryObj } from "@storybook/react";
import { EwResize } from "./EwResize";

const meta: Meta<typeof EwResize> = {
  title: "Components/EwResize",
  component: EwResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof EwResize>;

export const Default: Story = {};
