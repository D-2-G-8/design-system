import type { Meta, StoryObj } from "@storybook/react";
import { Crosshair } from "./Crosshair";

const meta: Meta<typeof Crosshair> = {
  title: "Components/Crosshair",
  component: Crosshair,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Crosshair>;

export const Default: Story = {};
