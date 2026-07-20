import type { Meta, StoryObj } from "@storybook/react";
import { SideMenuLecarSellerS } from "./SideMenuLecarSellerS";

const meta: Meta<typeof SideMenuLecarSellerS> = {
  title: "Components/SideMenuLecarSellerS",
  component: SideMenuLecarSellerS,
  args: { variant: "default" },
};
export default meta;

type Story = StoryObj<typeof SideMenuLecarSellerS>;

export const Default: Story = {};
export const Variant2: Story = { args: { variant: "variant2" } };
