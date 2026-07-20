import type { Meta, StoryObj } from "@storybook/react";
import { SaleSmall } from "./SaleSmall";

const meta: Meta<typeof SaleSmall> = {
  title: "Components/SaleSmall",
  component: SaleSmall,
  args: {},
};
export default meta;

type Story = StoryObj<typeof SaleSmall>;

export const Default: Story = {};
