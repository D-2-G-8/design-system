import type { Meta, StoryObj } from "@storybook/react";
import { VerticalText } from "./VerticalText";

const meta: Meta<typeof VerticalText> = {
  title: "Components/VerticalText",
  component: VerticalText,
  args: {},
};
export default meta;

type Story = StoryObj<typeof VerticalText>;

export const Default: Story = {};
