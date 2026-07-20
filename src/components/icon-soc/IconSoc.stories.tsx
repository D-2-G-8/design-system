import type { Meta, StoryObj } from "@storybook/react";
import { IconSoc } from "./IconSoc";

const meta: Meta<typeof IconSoc> = {
  title: "Components/IconSoc",
  component: IconSoc,
  args: { type: "vk" },
};
export default meta;

type Story = StoryObj<typeof IconSoc>;

export const Default: Story = {};
export const Vk: Story = { args: { type: "vk" } };
export const Odnoklassniki: Story = { args: { type: "odnoklassniki" } };
export const Telegram: Story = { args: { type: "telegram" } };
export const YouTube: Story = { args: { type: "youTube" } };
