import type { Meta, StoryObj } from "@storybook/react";
import { Segmentcontroll2 } from "./Segmentcontroll2";

const meta: Meta<typeof Segmentcontroll2> = {
  title: "Components/Segmentcontroll2",
  component: Segmentcontroll2,
  args: {
    size: "l",
    resizable: false,
  },
};
export default meta;

type Story = StoryObj<typeof Segmentcontroll2>;

export const Default: Story = {};
export const SizeL: Story = {
  args: {
    size: "l",
    resizable: false,
  },
};
export const SizeM: Story = {
  args: {
    size: "m",
    resizable: false,
  },
};
export const SizeMResizable: Story = {
  args: {
    size: "m",
    resizable: true,
  },
};
