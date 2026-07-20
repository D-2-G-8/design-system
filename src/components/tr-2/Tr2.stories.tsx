import type { Meta, StoryObj } from "@storybook/react";
import { Tr2 } from "./Tr2";

const meta: Meta<typeof Tr2> = {
  title: "Components/Tr2",
  component: Tr2,
  args: { variant: "default" },
};
export default meta;

type Story = StoryObj<typeof Tr2>;

export const Default: Story = {};
export const Variant2: Story = { args: { variant: "variant2" } };
export const Variant3: Story = { args: { variant: "variant3" } };
