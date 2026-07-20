import type { Meta, StoryObj } from "@storybook/react";
import { Viber } from "./Viber";

const meta: Meta<typeof Viber> = {
  title: "Components/Viber",
  component: Viber,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Viber>;

export const Default: Story = {};
