import type { Meta, StoryObj } from "@storybook/react";
import { IconCell } from "./Iconcell";

const meta: Meta<typeof IconCell> = {
  title: "Components/Iconcell",
  component: IconCell,
  args: { appearance: "off" },
};
export default meta;

type Story = StoryObj<typeof IconCell>;

export const Default: Story = {};
export const On: Story = { args: { appearance: "on" } };
