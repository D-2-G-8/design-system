import type { Meta, StoryObj } from "@storybook/react";
import { Pin } from "./Pin";

const meta: Meta<typeof Pin> = {
  title: "Components/Pin",
  component: Pin,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Pin>;

export const Default: Story = {};
