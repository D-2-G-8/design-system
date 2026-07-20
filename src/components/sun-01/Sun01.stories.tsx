import type { Meta, StoryObj } from "@storybook/react";
import { Sun01 } from "./Sun01";

const meta: Meta<typeof Sun01> = {
  title: "Components/Sun01",
  component: Sun01,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Sun01>;

export const Default: Story = {};
