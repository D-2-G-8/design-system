import type { Meta, StoryObj } from "@storybook/react";
import { ButtonToolbar40 } from "./ButtonToolbar40";

const meta: Meta<typeof ButtonToolbar40> = {
  title: "Components/ButtonToolbar40",
  component: ButtonToolbar40,
  args: {
    caption: false,
    state: "default",
  },
};
export default meta;

type Story = StoryObj<typeof ButtonToolbar40>;

export const Default: Story = {};

export const WithCaption: Story = {
  args: {
    caption: true,
  },
};

export const Active: Story = {
  args: {
    state: "active",
  },
};

export const ActiveWithCaption: Story = {
  args: {
    caption: true,
    state: "active",
  },
};

export const Disabled: Story = {
  args: {
    state: "disabled",
  },
};

export const DisabledWithCaption: Story = {
  args: {
    caption: true,
    state: "disabled",
  },
};
