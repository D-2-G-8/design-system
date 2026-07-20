import type { Meta, StoryObj } from "@storybook/react";
import { HeaderCollV10 } from "./HeaderCollV10";

const meta: Meta<typeof HeaderCollV10> = {
  title: "Components/HeaderCollV10",
  component: HeaderCollV10,
  args: {
    align: "left",
    isHovered: false,
  },
};
export default meta;

type Story = StoryObj<typeof HeaderCollV10>;

export const Default: Story = {};

export const AlignLeft: Story = {
  args: {
    align: "left",
  },
};

export const AlignLeftHovered: Story = {
  args: {
    align: "left",
    isHovered: true,
  },
};

export const AlignCenter: Story = {
  args: {
    align: "center",
  },
};

export const AlignCenterHovered: Story = {
  args: {
    align: "center",
    isHovered: true,
  },
};

export const AlignRight: Story = {
  args: {
    align: "right",
  },
};

export const AlignRightHovered: Story = {
  args: {
    align: "right",
    isHovered: true,
  },
};
