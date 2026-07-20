import type { Meta, StoryObj } from "@storybook/react";
import { Whatsapp } from "./Whatsapp";

const meta: Meta<typeof Whatsapp> = {
  title: "Components/Whatsapp",
  component: Whatsapp,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Whatsapp>;

export const Default: Story = {};
