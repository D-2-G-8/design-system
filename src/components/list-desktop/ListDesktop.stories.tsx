import type { Meta, StoryObj } from "@storybook/react";
import { ListDesktop } from "./ListDesktop";

const meta: Meta<typeof ListDesktop> = {
  title: "Components/ListDesktop",
  component: ListDesktop,
  args: {
    size: "L",
  },
};
export default meta;

type Story = StoryObj<typeof ListDesktop>;

export const Default: Story = {};
