import type { Meta, StoryObj } from "@storybook/react";
import { RowResize } from "./RowResize";

const meta: Meta<typeof RowResize> = {
  title: "Components/RowResize",
  component: RowResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof RowResize>;

export const Default: Story = {};
