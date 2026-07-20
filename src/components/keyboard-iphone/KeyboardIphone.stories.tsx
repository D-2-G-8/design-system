import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardIphone } from "./KeyboardIphone";

const meta: Meta<typeof KeyboardIphone> = {
  title: "Components/KeyboardIphone",
  component: KeyboardIphone,
  args: { type: "default" },
};
export default meta;

type Story = StoryObj<typeof KeyboardIphone>;

export const Default: Story = {};
