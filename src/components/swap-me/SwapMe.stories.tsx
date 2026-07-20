import type { Meta, StoryObj } from "@storybook/react";
import { SwapMe } from "./SwapMe";

const meta: Meta<typeof SwapMe> = {
  title: "Components/SwapMe",
  component: SwapMe,
  args: {},
};
export default meta;

type Story = StoryObj<typeof SwapMe>;

export const Default: Story = {};
