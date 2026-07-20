import type { Meta, StoryObj } from "@storybook/react";
import { NavBarButtonB2b } from "./NavBarButtonB2b";

const meta: Meta<typeof NavBarButtonB2b> = {
  title: "Components/NavBarButtonB2b",
  component: NavBarButtonB2b,
  args: {
    text: true,
    icon: true,
    state: "default",
  },
};
export default meta;

type Story = StoryObj<typeof NavBarButtonB2b>;

export const Default: Story = {};

export const TextAndIconHover: Story = {
  args: {
    text: true,
    icon: true,
    state: "hover",
  },
};

export const TextAndIconActive: Story = {
  args: {
    text: true,
    icon: true,
    state: "active",
  },
};

export const TextAndIconToggled: Story = {
  args: {
    text: true,
    icon: true,
    state: "toggled",
  },
};

export const TextOnly: Story = {
  args: {
    text: true,
    icon: false,
    state: "default",
  },
};

export const TextOnlyHover: Story = {
  args: {
    text: true,
    icon: false,
    state: "hover",
  },
};

export const IconOnly: Story = {
  args: {
    text: false,
    icon: true,
    state: "default",
  },
};

export const IconOnlyHover: Story = {
  args: {
    text: false,
    icon: true,
    state: "hover",
  },
};

export const IconOnlyActive: Story = {
  args: {
    text: false,
    icon: true,
    state: "active",
  },
};

export const IconOnlyToggled: Story = {
  args: {
    text: false,
    icon: true,
    state: "toggled",
  },
};

export const NoTextNoIcon: Story = {
  args: {
    text: false,
    icon: false,
    state: "default",
  },
};
