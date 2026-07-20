import type { Meta, StoryObj } from "@storybook/react";
import { Truck } from "./Truck";

const meta: Meta<typeof Truck> = {
  title: "Components/Truck",
  component: Truck,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Truck>;

export const Default: Story = {};
