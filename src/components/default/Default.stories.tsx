import type { Meta, StoryObj } from "@storybook/react";
import { Default } from "./Default";

const meta: Meta<typeof Default> = {
  title: "Components/Default",
  component: Default,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Default>;

export const Default: Story = {};
