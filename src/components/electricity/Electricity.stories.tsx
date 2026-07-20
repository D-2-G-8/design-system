import type { Meta, StoryObj } from "@storybook/react";
import { Electricity } from "./Electricity";

const meta: Meta<typeof Electricity> = {
  title: "Components/Electricity",
  component: Electricity,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Electricity>;

export const Default: Story = {};
