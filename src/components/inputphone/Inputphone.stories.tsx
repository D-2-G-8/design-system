import type { Meta, StoryObj } from "@storybook/react";
import { Inputphone as Component } from "./Inputphone";

const meta: Meta<typeof Component> = {
  title: "Components/Inputphone",
  component: Component,
  args: {
    label: "Label",
    placeholder: "+7 900 000-00-00",
    description: "Description",
    size: "lg",
    labelOutside: true,
  },
  argTypes: {
    value: {
      description: "Controlled phone number value; pass together with onChange to drive the input from the parent, or omit both to let the component manage its own internal state.",
      control: "text",
    },
    defaultValue: {
      description: "Initial phone number value when uncontrolled; ignored if `value` is provided.",
      control: "text",
    },
    onChange: {
      description: "Callback fired when the phone number changes, providing the new formatted value; use together with `value` for controlled mode or omit both for uncontrolled.",
    },
    label: {
      description: "Text label displayed above the input field when labelOutside is true, or as a floating label inside the field when labelOutside is false and the input is empty; required for accessibility.",
      control: "text",
    },
    labelOutside: {
      description: "When true, the label is positioned above the input field as a separate element; when false (default), the label appears inside the field as a placeholder until the user focuses or fills the input.",
      control: "boolean",
    },
    placeholder: {
      description: "Placeholder text shown inside the input when empty (default is the phone mask '+7 900 000-00-00'); only relevant when labelOutside is true or label is not provided.",
      control: "text",
    },
    description: {
      description: "Optional helper text displayed below the input to provide additional context or instructions.",
      control: "text",
    },
    error: {
      description: "When true, applies error styling (red border, error icon) to indicate validation failure; typically paired with an error message in the description prop.",
      control: "boolean",
    },
    disabled: {
      description: "When true, the input is non-interactive and displays with a gray background; use for fields that cannot be edited in the current context.",
      control: "boolean",
    },
    readOnly: {
      description: "When true, the input displays its value as plain text without a border or background (no interactive field chrome); use for display-only scenarios where the value should not be editable.",
      control: "boolean",
    },
    readOnlyLowProfile: {
      description: "When true and readOnly is also true, collapses the field height to just the text line (no padding or background), creating an ultra-compact read-only display.",
      control: "boolean",
    },
    size: {
      description: "Visual size of the input: 'sm' renders a 40px tall field with 10px border radius and 14px horizontal padding; 'lg' (default) renders a 52px tall field with 12px radius and 16px padding.",
      control: { type: "select" },
      options: ["sm", "lg"],
    },
    tooltipPlacement: {
      description: "Placement of the optional tooltip icon and popover relative to the input field; only relevant when a tooltip is provided.",
      control: { type: "select" },
      options: ["top", "right", "bottom"],
    },
    tooltipText: {
      description: "Optional tooltip content displayed in a popover when the user hovers or clicks the info icon rendered alongside the input.",
      control: "text",
    },
    onClear: {
      description: "Callback fired when the user clicks the clear icon (X) shown in focus or error-focus states; if provided, the clear icon is rendered and clicking it invokes this callback (typically to reset the value to empty).",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const SizeSmall: Story = {
  args: {
    size: "sm",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "+7 900 000-00-00",
  },
};

export const LabelInside: Story = {
  args: {
    labelOutside: false,
  },
};

export const Error: Story = {
  args: {
    error: true,
    defaultValue: "+7 900 000-00-00",
    description: "Invalid phone number",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "+7 900 000-00-00",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "+7 900 000-00-00",
  },
};

export const ReadOnlyLowProfile: Story = {
  args: {
    readOnly: true,
    readOnlyLowProfile: true,
    defaultValue: "+7 900 000-00-00",
  },
};

export const WithTooltip: Story = {
  args: {
    tooltipText: "Tooltip text",
    tooltipPlacement: "bottom",
  },
};

export const WithClear: Story = {
  args: {
    defaultValue: "+7 900 000-00-00",
    onClear: () => console.log("Clear clicked"),
  },
};