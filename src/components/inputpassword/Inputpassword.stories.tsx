import type { Meta, StoryObj } from "@storybook/react";
import { Inputpassword as Component } from "./Inputpassword";

const meta: Meta<typeof Component> = {
  title: "Components/Inputpassword",
  component: Component,
  argTypes: {
    size: {
      description: "Visual size of the input field; 'sm' corresponds to 40px height with 10px border radius and 14px horizontal padding, 'lg' corresponds to 52px height with 12px border radius and 16px horizontal padding, defaults to 'lg' if omitted.",
      control: { type: "select" },
      options: ["sm", "lg"],
    },
    value: {
      description: "Controlled value of the password input; pass together with onChange to drive it from the parent, or omit both to let the component manage its own value as an uncontrolled input.",
      control: "text",
    },
    defaultValue: {
      description: "Initial value when uncontrolled; ignored if value prop is provided, allowing the component to seed its internal state without parent control.",
      control: "text",
    },
    onChange: {
      description: "Callback fired on every input change with the new value; use together with value prop for controlled behavior, or omit for uncontrolled usage.",
    },
    placeholder: {
      description: "Placeholder text shown when the input is empty; displayed in a muted color (#b8b8b8) and hidden once the user starts typing.",
      control: "text",
    },
    label: {
      description: "Label text displayed above or inside the input field depending on labelOutside prop; omit to render the input without any label.",
      control: "text",
    },
    labelOutside: {
      description: "Whether the label appears outside (above) the input field; true renders the label as a separate row above the field, false embeds it within the field container, defaults to true if omitted.",
      control: "boolean",
    },
    description: {
      description: "Descriptive helper text displayed below the input field; provides additional context or instructions to the user, omit to render without description.",
      control: "text",
    },
    error: {
      description: "Whether the input is in an error state; true applies error styling (orange #ff5d2a border) and shows an error icon, defaults to false if omitted.",
      control: "boolean",
    },
    success: {
      description: "Whether the input is in a success state; true applies success styling and shows a success icon (fill-done), ignored if error is true, defaults to false if omitted.",
      control: "boolean",
    },
    disabled: {
      description: "Whether the input is disabled; true prevents user interaction, applies disabled styling (gray background #f5f5f5, muted text #757575), and hides interactive icons, defaults to false if omitted.",
      control: "boolean",
    },
    showPassword: {
      description: "Controlled visibility state of the password; true reveals the password in plain text with a 'view-off' icon, false masks it with bullets and shows a 'view' icon, pass together with onShowPasswordChange to control from parent or omit both for component-managed state.",
      control: "boolean",
    },
    defaultShowPassword: {
      description: "Initial password visibility when uncontrolled; ignored if showPassword prop is provided, defaults to false (password masked) if omitted.",
      control: "boolean",
    },
    onShowPasswordChange: {
      description: "Callback fired when the user toggles password visibility via the view/view-off icon; use together with showPassword prop for controlled behavior, or omit for uncontrolled usage.",
    },
    onClear: {
      description: "Callback fired when the user clicks the clear icon (outline-regular-close); the component displays this icon only when the input has a value and this callback is provided, allowing the parent to handle clearing logic.",
    },
    tooltipText: {
      description: "Text content for an optional tooltip displayed near the input; omit to render without any tooltip, the tooltip placement is configurable via tooltipPlacement prop.",
      control: "text",
    },
    tooltipPlacement: {
      description: "Placement of the tooltip relative to the input field; only applies when tooltipText is provided, defaults to 'bottom' if omitted.",
      control: { type: "select" },
      options: ["top", "bottom", "right"],
    },
  },
  args: {
    label: "Label",
    placeholder: "Placeholder",
    description: "Description",
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const LargeFilled: Story = {
  args: {
    size: "lg",
    defaultValue: "Qwerty1234",
  },
};

export const SmallFilled: Story = {
  args: {
    size: "sm",
    defaultValue: "Qwerty1234",
  },
};

export const Error: Story = {
  args: {
    defaultValue: "Qwerty1234",
    error: true,
  },
};

export const Success: Story = {
  args: {
    defaultValue: "Qwerty1234",
    success: true,
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: "Qwerty1234",
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    labelOutside: false,
    defaultValue: "Qwerty1234",
  },
};

export const EmptyWithPlaceholder: Story = {
  args: {
    defaultValue: "",
    placeholder: "Enter your password",
  },
};

export const WithTooltip: Story = {
  args: {
    defaultValue: "Qwerty1234",
    tooltipText: "Tooltip text",
    tooltipPlacement: "bottom",
  },
};

export const SmallSize: Story = {
  args: {
    size: "sm",
  },
};

export const ErrorFocus: Story = {
  args: {
    defaultValue: "Qwerty1234",
    error: true,
  },
};

export const WithClearHandler: Story = {
  args: {
    defaultValue: "Qwerty1234",
    onClear: () => console.log("Clear clicked"),
  },
};