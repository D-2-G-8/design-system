import type { Meta, StoryObj } from "@storybook/react";
import { Protochevron } from "./Protochevron";

const meta: Meta<typeof Protochevron> = {
  title: "Components/Protochevron",
  component: Protochevron,
  args: { variant: "default" },
};
export default meta;

type Story = StoryObj<typeof Protochevron>;

export const Default: Story = {};
export const Variant2: Story = { args: { variant: "variant2" } };
export const Variant3: Story = { args: { variant: "variant3" } };
