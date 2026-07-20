import type { Meta, StoryObj } from "@storybook/react";
import { ScrollBarV10 } from "./ScrollBarV10";

const meta: Meta<typeof ScrollBarV10> = {
  title: "Components/ScrollBarV10",
  component: ScrollBarV10,
  args: { coordinate: "x" },
};
export default meta;

type Story = StoryObj<typeof ScrollBarV10>;

export const Default: Story = {};
export const XCoordinate: Story = { args: { coordinate: "x" } };
export const YCoordinate: Story = { args: { coordinate: "y" } };
