import type { Meta, StoryObj } from "@storybook/react";
import { KeysIphone } from "./KeysIphone";

const meta: Meta<typeof KeysIphone> = {
  title: "Components/KeysIphone",
  component: KeysIphone,
  args: {
    mode: "light",
    type: "lowercase",
    state: "normal",
  },
};
export default meta;

type Story = StoryObj<typeof KeysIphone>;

export const Default: Story = {};

export const LightNormal: Story = {
  args: {
    mode: "light",
    type: "lowercase",
    state: "normal",
  },
};

export const LightSecondary: Story = {
  args: {
    mode: "light",
    type: "lowercase",
    state: "secondary",
  },
};

export const LightEmphasized: Story = {
  args: {
    mode: "light",
    type: "lowercase",
    state: "emphasized",
  },
};

export const DarkNormal: Story = {
  args: {
    mode: "dark",
    type: "lowercase",
    state: "normal",
  },
};

export const DarkSecondary: Story = {
  args: {
    mode: "dark",
    type: "lowercase",
    state: "secondary",
  },
};

export const DarkEmphasized: Story = {
  args: {
    mode: "dark",
    type: "lowercase",
    state: "emphasized",
  },
};

export const Uppercase: Story = {
  args: {
    mode: "light",
    type: "uppercase",
    state: "normal",
  },
};

export const UppercaseDark: Story = {
  args: {
    mode: "dark",
    type: "uppercase",
    state: "normal",
  },
};
