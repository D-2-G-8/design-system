import type { Meta, StoryObj } from "@storybook/react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Pagination",
  component: Pagination,
  args: { position: "beginning" },
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {};
export const Beginning: Story = { args: { position: "beginning" } };
export const Middle: Story = { args: { position: "middle" } };
export const End: Story = { args: { position: "end" } };
