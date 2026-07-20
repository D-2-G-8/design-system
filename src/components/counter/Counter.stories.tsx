import type { Meta, StoryObj } from "@storybook/react";
import { Counter } from "./Counter";

const meta: Meta<typeof Counter> = {
  title: "Components/Counter",
  component: Counter,
  args: {
    theme: "light",
    size: "m",
    max: false,
  },
};
export default meta;

type Story = StoryObj<typeof Counter>;

export const Default: Story = {};

export const LightMedium: Story = {
  args: {
    theme: "light",
    size: "m",
    max: false,
  },
};

export const LightLarge: Story = {
  args: {
    theme: "light",
    size: "l",
    max: false,
  },
};

export const LightSmall: Story = {
  args: {
    theme: "light",
    size: "s",
    max: false,
  },
};

export const DarkMedium: Story = {
  args: {
    theme: "dark",
    size: "m",
    max: false,
  },
};

export const DarkLarge: Story = {
  args: {
    theme: "dark",
    size: "l",
    max: false,
  },
};

export const DarkSmall: Story = {
  args: {
    theme: "dark",
    size: "s",
    max: false,
  },
};

export const WithMax: Story = {
  args: {
    theme: "light",
    size: "m",
    max: true,
  },
};

export const DarkWithMax: Story = {
  args: {
    theme: "dark",
    size: "l",
    max: true,
  },
};
