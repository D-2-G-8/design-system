import type { Meta, StoryObj } from "@storybook/react";
import { ActivationControl } from "./ActivationControl";

const meta: Meta<typeof ActivationControl> = {
  title: "Components/ActivationControl",
  component: ActivationControl,
  args: {},
};
export default meta;

type Story = StoryObj<typeof ActivationControl>;

export const Default: Story = {};
