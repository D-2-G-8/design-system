import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Components/Toast",
  component: Toast,
  args: {
    state: "message",
    theme: "light",
    appearance: "desktop",
    subtitle: undefined,
    icon: "none",
    message: "This is a toast message",
  },
};
export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {};

export const Message: Story = {
  args: {
    state: "message",
    message: "Your changes have been saved",
  },
};

export const Error: Story = {
  args: {
    state: "error",
    message: "Failed to save changes",
  },
};

export const Done: Story = {
  args: {
    state: "done",
    message: "Operation completed successfully",
  },
};

export const Info: Story = {
  args: {
    state: "info",
    message: "New updates are available",
  },
};

export const Warning: Story = {
  args: {
    state: "warning",
    message: "This action cannot be undone",
  },
};

export const WithSubtitle: Story = {
  args: {
    state: "info",
    message: "New feature available",
    subtitle: "Click here to learn more about the latest updates",
  },
};

export const WithIcon: Story = {
  args: {
    state: "done",
    icon: "left",
    message: "File uploaded successfully",
  },
};

export const DarkTheme: Story = {
  args: {
    theme: "dark",
    state: "message",
    message: "This is a dark themed toast",
  },
};

export const Mobile: Story = {
  args: {
    appearance: "mobile",
    state: "warning",
    message: "Mobile toast notification",
  },
};

export const DarkWithSubtitleAndIcon: Story = {
  args: {
    theme: "dark",
    state: "info",
    icon: "left",
    message: "System update required",
    subtitle: "Please restart your device to apply the latest security patches",
    appearance: "desktop",
  },
};

export const MobileWithIcon: Story = {
  args: {
    appearance: "mobile",
    state: "error",
    icon: "left",
    message: "Connection failed",
    subtitle: "Check your internet connection",
  },
};
