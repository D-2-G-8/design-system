import type { Meta, StoryObj } from "@storybook/react";
import { Telegram } from "./Telegram";

const meta: Meta<typeof Telegram> = {
  title: "Components/Telegram",
  component: Telegram,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Telegram>;

export const Default: Story = {};
