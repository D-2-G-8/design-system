import type { Meta, StoryObj } from "@storybook/react";
import { EResize } from "./EResize";

const meta: Meta<typeof EResize> = {
  title: "Components/EResize",
  component: EResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof EResize>;

export const Default: Story = {};
