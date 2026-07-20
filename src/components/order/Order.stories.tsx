import type { Meta, StoryObj } from "@storybook/react";
import { Order } from "./Order";

const meta: Meta<typeof Order> = {
  title: "Components/Order",
  component: Order,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Order>;

export const Default: Story = {};
