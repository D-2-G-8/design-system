import type { Meta, StoryObj } from "@storybook/react";
import { Attachment01 } from "./Attachment01";

const meta: Meta<typeof Attachment01> = {
  title: "Components/Attachment01",
  component: Attachment01,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Attachment01>;

export const Default: Story = {};
