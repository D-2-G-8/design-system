import type { Meta, StoryObj } from "@storybook/react";
import { Table3 } from "./Table3";

const meta: Meta<typeof Table3> = {
  title: "Components/Table3",
  component: Table3,
  args: {
    variant: "default",
    mode: "1",
  },
};
export default meta;

type Story = StoryObj<typeof Table3>;

export const Default: Story = {};
export const Hover: Story = { args: { variant: "hover" } };
export const Active: Story = { args: { variant: "active" } };
export const Mode2: Story = { args: { mode: "2" } };
export const HoverMode2: Story = { args: { variant: "hover", mode: "2" } };
export const ActiveMode2: Story = { args: { variant: "active", mode: "2" } };
