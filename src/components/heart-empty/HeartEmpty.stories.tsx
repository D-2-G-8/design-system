import type { Meta, StoryObj } from "@storybook/react";
import { HeartEmpty } from "./HeartEmpty";

const meta: Meta<typeof HeartEmpty> = {
  title: "Components/HeartEmpty",
  component: HeartEmpty,
  args: {},
};
export default meta;

type Story = StoryObj<typeof HeartEmpty>;

export const Default: Story = {};
