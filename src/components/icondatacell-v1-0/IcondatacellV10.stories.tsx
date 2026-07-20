import type { Meta, StoryObj } from "@storybook/react";
import { IcondatacellV10 } from "./IcondatacellV10";

const meta: Meta<typeof IcondatacellV10> = {
  title: "Components/IcondatacellV10",
  component: IcondatacellV10,
  args: {
    link: false,
    visited: false,
  },
};
export default meta;

type Story = StoryObj<typeof IcondatacellV10>;

export const Default: Story = {};

export const Link: Story = {
  args: {
    link: true,
  },
};

export const Visited: Story = {
  args: {
    link: true,
    visited: true,
  },
};
