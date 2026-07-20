import type { Meta, StoryObj } from "@storybook/react";
import { DropdownMenuRow } from "./DropdownMenuRow";
import { CheckIcon, ChevronRightIcon, HomeIcon, SettingsIcon } from "@heroicons/react/24/outline";

const meta: Meta<typeof DropdownMenuRow> = {
  title: "Components/DropdownMenuRow",
  component: DropdownMenuRow,
  args: {
    content: "string",
    label: "Menu Item",
    disabled: false,
  },
};
export default meta;

type Story = StoryObj<typeof DropdownMenuRow>;

export const Default: Story = {};

export const String: Story = {
  args: {
    content: "string",
    label: "Simple Text Item",
  },
};

export const CheckboxString: Story = {
  args: {
    content: "checkbox-string",
    label: "Option with Checkbox",
    checked: false,
  },
};

export const CheckboxStringChecked: Story = {
  args: {
    content: "checkbox-string",
    label: "Selected Option",
    checked: true,
  },
};

export const IconString: Story = {
  args: {
    content: "icon-string",
    label: "Home",
    icon: <HomeIcon className="w-5 h-5" />,
  },
};

export const StringIcon: Story = {
  args: {
    content: "string-icon",
    label: "Navigate",
    trailingIcon: <ChevronRightIcon className="w-5 h-5" />,
  },
};

export const IconStringIcon: Story = {
  args: {
    content: "icon-string-icon",
    label: "Settings",
    icon: <SettingsIcon className="w-5 h-5" />,
    trailingIcon: <ChevronRightIcon className="w-5 h-5" />,
  },
};

export const IconOption: Story = {
  args: {
    content: "icon-option",
    label: "Quick Action",
    icon: <CheckIcon className="w-5 h-5" />,
  },
};

export const Disabled: Story = {
  args: {
    content: "string",
    label: "Disabled Item",
    disabled: true,
  },
};

export const DisabledWithIcon: Story = {
  args: {
    content: "icon-string",
    label: "Disabled with Icon",
    icon: <HomeIcon className="w-5 h-5" />,
    disabled: true,
  },
};
