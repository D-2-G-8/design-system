import type { Meta, StoryObj } from "@storybook/react";
import { TfootCell } from "./TfootCell";

const meta: Meta<typeof TfootCell> = {
  title: "Components/TfootCell",
  component: TfootCell,
  args: {
    type: "rowControl",
    children: "Footer cell",
  },
};
export default meta;

type Story = StoryObj<typeof TfootCell>;

export const Default: Story = {};

export const RowControl: Story = {
  args: {
    type: "rowControl",
  },
};

export const TableHeader: Story = {
  args: {
    type: "tableHeader",
  },
};

export const NumberFille: Story = {
  args: {
    type: "numberFille",
  },
};
