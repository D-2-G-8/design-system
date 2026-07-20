import type { Meta, StoryObj } from "@storybook/react";
import { Sale } from "./Sale";

const meta: Meta<typeof Sale> = {
  title: "Components/Sale",
  component: Sale,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Sale>;

export const Default: Story = {};
