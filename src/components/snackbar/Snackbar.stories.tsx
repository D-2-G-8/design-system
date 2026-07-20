import type { Meta, StoryObj } from "@storybook/react";
import { Snackbar } from "./Snackbar";

const meta: Meta<typeof Snackbar> = {
  title: "Components/Snackbar",
  component: Snackbar,
  args: {
    state: "message",
    theme: "light",
    appearance: "desktop",
    subtitle: "",
    icon: "none",
    message: "This is a snackbar message",
  },
};
export default meta;

type Story = StoryObj<typeof Snackbar>;

export const Default: Story = {};

export const LightDesktopMessage: Story = {
  args: {
    state: "message",
    theme: "light",
    appearance: "desktop",
    icon: "none",
    subtitle: "",
  },
};

export const LightDesktopError: Story = {
  args: {
    state: "error",
    theme: "light",
    appearance: "desktop",
    icon: "left",
    message: "An error occurred",
  },
};

export const LightDesktopDone: Story = {
  args: {
    state: "done",
    theme: "light",
    appearance: "desktop",
    icon: "left",
    message: "Action completed successfully",
  },
};

export const LightDesktopInfo: Story = {
  args: {
    state: "info",
    theme: "light",
    appearance: "desktop",
    icon: "left",
    message: "Here is some information",
  },
};

export const LightDesktopWarning: Story = {
  args: {
    state: "warning",
    theme: "light",
    appearance: "desktop",
    icon: "left",
    message: "Warning: please check your input",
  },
};

export const DarkDesktopWithIconAndSubtitle: Story = {
  args: {
    state: "info",
    theme: "dark",
    appearance: "desktop",
    icon: "left",
    subtitle: "Additional context information",
    message: "Main message with subtitle",
  },
};

export const DarkDesktopError: Story = {
  args: {
    state: "error",
    theme: "dark",
    appearance: "desktop",
    icon: "left",
    message: "Error in dark theme",
  },
};

export const MobileMessage: Story = {
  args: {
    state: "message",
    theme: "light",
    appearance: "mobile",
    icon: "none",
    message: "Mobile snackbar message",
  },
};

export const MobileWithSubtitle: Story = {
  args: {
    state: "info",
    theme: "light",
    appearance: "mobile",
    icon: "left",
    subtitle: "Mobile subtitle text",
    message: "Mobile message with icon and subtitle",
  },
};

export const DarkMobile: Story = {
  args: {
    state: "done",
    theme: "dark",
    appearance: "mobile",
    icon: "left",
    message: "Success on mobile dark theme",
  },
};
