import type { Meta, StoryObj } from "@storybook/react";
import { Grabbing } from "./Grabbing";

const meta: Meta<typeof Grabbing> = {
  title: "Components/Grabbing",
  component: Grabbing,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Grabbing>;

export const Default: Story = {};
