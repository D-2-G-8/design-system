import type { Meta, StoryObj } from "@storybook/react";
import { Inputtext as Component } from "./Inputtext";

const meta: Meta<typeof Component> = {
  title: "Components/Inputtext",
  component: Component,
  argTypes: {
    size: {
      description: "Height of the input field in pixels; '52' for the larger variant or '40' for the compact variant.",
      control: { type: "select" },
      options: ["52", "40"],
    },
    label: {
      description: "Label text displayed above or inside the field depending on labelOutside; if omitted, no label is shown.",
      control: "text",
    },
    labelOutside: {
      description: "When true, label appears above the field; when false, label appears inside the field as a floating label; defaults to false.",
      control: "boolean",
    },
    value: {
      description: "Controlled value of the input; pass together with onChange to drive it from the parent, or omit both to let the component manage its own value as an uncontrolled input.",
      control: "text",
    },
    defaultValue: {
      description: "Initial value when uncontrolled; ignored if value is provided.",
      control: "text",
    },
    onChange: {
      description: "Callback fired on every input change with the new value; required for controlled usage, optional for uncontrolled.",
    },
    placeholder: {
      description: "Placeholder text shown when the field is empty and label is outside or no label is present.",
      control: "text",
    },
    description: {
      description: "Helper or description text displayed below the field; if omitted, no description is shown.",
      control: "text",
    },
    error: {
      description: "When true, applies error styling (red border and error-colored description text); defaults to false.",
      control: "boolean",
    },
    disabled: {
      description: "When true, disables the input (gray background, no interaction); defaults to false.",
      control: "boolean",
    },
    readOnly: {
      description: "When true, makes the input read-only (no border, no background fill, text-only display); defaults to false.",
      control: "boolean",
    },
    readOnlyLowProfile: {
      description: "When true and readOnly is also true, renders a minimal read-only variant with reduced height and no field container; ignored if readOnly is false.",
      control: "boolean",
    },
    loading: {
      description: "When true, displays a loading spinner icon in the icon container; defaults to false.",
      control: "boolean",
    },
    startIcon: {
      description: "Icon or component to display at the start of the icon container on the right side of the field; if omitted, no start icon is shown.",
    },
    endIcon: {
      description: "Icon or component to display at the end of the icon container on the right side of the field; if omitted, no end icon is shown.",
    },
    maxLength: {
      description: "Maximum number of characters allowed; when provided, a character count is displayed in the label row for size 40; if omitted, no character limit is enforced.",
      control: "number",
    },
    tooltipText: {
      description: "Tooltip content to display; if omitted, no tooltip is shown.",
      control: "text",
    },
    tooltipPlacement: {
      description: "Placement of the tooltip relative to the input field; defaults to 'bottom' if tooltipText is provided.",
      control: { type: "select" },
      options: ["top", "bottom", "right"],
    },
  },
  args: {
    size: "52",
    label: "Label",
    labelOutside: true,
    placeholder: "Placeholder",
    description: "Description",
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Size40: Story = {
  args: {
    size: "40",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Value",
  },
};

export const Error: Story = {
  args: {
    error: true,
    defaultValue: "Value",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "Value",
  },
};

export const DisabledError: Story = {
  args: {
    disabled: true,
    error: true,
    defaultValue: "Value",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: "Value",
  },
};

export const ReadOnlyLowProfile: Story = {
  args: {
    readOnly: true,
    readOnlyLowProfile: true,
    defaultValue: "Value",
  },
};

export const LabelInside: Story = {
  args: {
    labelOutside: false,
    defaultValue: "Value",
  },
};

export const LabelInsideEmpty: Story = {
  args: {
    labelOutside: false,
  },
};

export const WithIcons: Story = {
  args: {
    defaultValue: "Value",
    startIcon: (
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
    endIcon: (
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <rect x={3} y={4} width={14} height={13} rx={2} stroke="currentColor" strokeWidth={1.5} />
        <path d="M3 8h14M7 1v3m6-3v3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    defaultValue: "Value",
    endIcon: (
      <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <rect x={3} y={4} width={14} height={13} rx={2} stroke="currentColor" strokeWidth={1.5} />
        <path d="M3 8h14M7 1v3m6-3v3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    ),
  },
};

export const WithMaxLength: Story = {
  args: {
    size: "40",
    maxLength: 128,
    defaultValue: "Value",
  },
};

export const WithTooltip: Story = {
  args: {
    tooltipText: "Tooltip text",
    tooltipPlacement: "bottom",
  },
};