import type { Meta, StoryObj } from "@storybook/react";
import { Attach } from "./Attach";

const meta: Meta<typeof Attach> = {
  title: "Components/Attach",
  component: Attach,
  args: {
    theme: "light",
    appearance: "desktop",
    state: "passive",
  },
};
export default meta;

type Story = StoryObj<typeof Attach>;

export const Default: Story = {};

export const LightDesktopPassive: Story = {
  args: {
    theme: "light",
    appearance: "desktop",
    state: "passive",
  },
};

export const LightDesktopFilled: Story = {
  args: {
    theme: "light",
    appearance: "desktop",
    state: "filled",
  },
};

export const LightDesktopLimit: Story = {
  args: {
    theme: "light",
    appearance: "desktop",
    state: "limit",
  },
};

export const LightDesktopError: Story = {
  args: {
    theme: "light",
    appearance: "desktop",
    state: "error",
  },
};

export const LightMobilePassive: Story = {
  args: {
    theme: "light",
    appearance: "mobile",
    state: "passive",
  },
};

export const LightMobileFilled: Story = {
  args: {
    theme: "light",
    appearance: "mobile",
    state: "filled",
  },
};

export const DarkDesktopPassive: Story = {
  args: {
    theme: "dark",
    appearance: "desktop",
    state: "passive",
  },
};

export const DarkDesktopFilled: Story = {
  args: {
    theme: "dark",
    appearance: "desktop",
    state: "filled",
  },
};

export const DarkDesktopLimit: Story = {
  args: {
    theme: "dark",
    appearance: "desktop",
    state: "limit",
  },
};

export const DarkDesktopError: Story = {
  args: {
    theme: "dark",
    appearance: "desktop",
    state: "error",
  },
};

export const DarkMobilePassive: Story = {
  args: {
    theme: "dark",
    appearance: "mobile",
    state: "passive",
  },
};

export const DarkMobileFilled: Story = {
  args: {
    theme: "dark",
    appearance: "mobile",
    state: "filled",
  },
};
