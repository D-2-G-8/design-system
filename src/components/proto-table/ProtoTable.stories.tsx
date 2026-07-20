import type { Meta, StoryObj } from "@storybook/react";
import { ProtoTable } from "./ProtoTable";

const meta: Meta<typeof ProtoTable> = {
  title: "Components/ProtoTable",
  component: ProtoTable,
  args: { variant: "default" },
};
export default meta;

type Story = StoryObj<typeof ProtoTable>;

export const Default: Story = {};
export const Hover: Story = { args: { variant: "hover" } };
