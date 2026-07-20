import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  args: {
    product: "b2c",
    type: "radio",
    size: "s",
    active: false,
  },
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const B2CRadioSmallOn: Story = {
  args: {
    product: "b2c",
    type: "radio",
    size: "s",
    active: true,
  },
};

export const B2CRadioSmallOff: Story = {
  args: {
    product: "b2c",
    type: "radio",
    size: "s",
    active: false,
  },
};

export const B2CCheckboxSmallOn: Story = {
  args: {
    product: "b2c",
    type: "checkbox",
    size: "s",
    active: true,
  },
};

export const B2CCheckboxSmallOff: Story = {
  args: {
    product: "b2c",
    type: "checkbox",
    size: "s",
    active: false,
  },
};

export const B2CRadioMedium: Story = {
  args: {
    product: "b2c",
    type: "radio",
    size: "m",
    active: true,
  },
};

export const B2CRadioLarge: Story = {
  args: {
    product: "b2c",
    type: "radio",
    size: "l",
    active: true,
  },
};

export const B2BRadioSmallOn: Story = {
  args: {
    product: "b2b",
    type: "radio",
    size: "s",
    active: true,
  },
};

export const B2BCheckboxSmallOn: Story = {
  args: {
    product: "b2b",
    type: "checkbox",
    size: "s",
    active: true,
  },
};
