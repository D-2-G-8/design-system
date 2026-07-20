import type { Meta, StoryObj } from "@storybook/react";
import { Alias } from "./Alias";

const meta: Meta<typeof Alias> = {
  title: "Components/Alias",
  component: Alias,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Alias>;

export const Default: Story = {};
