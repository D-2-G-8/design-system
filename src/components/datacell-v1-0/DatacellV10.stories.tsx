import type { Meta, StoryObj } from "@storybook/react";
import { DatacellV10 } from "./DatacellV10";

const meta: Meta<typeof DatacellV10> = {
  title: "Components/DatacellV10",
  component: DatacellV10,
  args: {
    type: "string",
    align: "left",
    hasMultipleValues: false,
  },
};
export default meta;

type Story = StoryObj<typeof DatacellV10>;

export const Default: Story = {};

export const StringLeft: Story = {
  args: {
    type: "string",
    align: "left",
    hasMultipleValues: false,
  },
};

export const StringCenter: Story = {
  args: {
    type: "string",
    align: "center",
    hasMultipleValues: false,
  },
};

export const StringRight: Story = {
  args: {
    type: "string",
    align: "right",
    hasMultipleValues: false,
  },
};

export const StringCenterMultipleValues: Story = {
  args: {
    type: "string",
    align: "center",
    hasMultipleValues: true,
  },
};

export const Select: Story = {
  args: {
    type: "select",
    align: "left",
    hasMultipleValues: false,
  },
};
