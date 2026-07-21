import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip as Component } from "./Tooltip";

const meta: Meta<typeof Component> = {
  title: "Components/Tooltip",
  component: Component,
  argTypes: {
    placement: {
      description: "Controls the tooltip's position relative to its trigger element; defaults to 'top' if omitted.",
      control: { type: "select" },
      options: [
        "top",
        "top-start",
        "top-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
        "right",
        "right-start",
        "right-end",
      ],
    },
    open: {
      description: "Controlled open state; pass together with onOpenChange to drive visibility from the parent, or omit both to let the component manage its own show/hide state on hover/focus.",
      control: "boolean",
    },
    defaultOpen: {
      description: "Initial open state when uncontrolled; ignored if `open` is provided, defaults to false if omitted.",
      control: "boolean",
    },
    onOpenChange: {
      description: "Callback fired every time the tooltip's visibility changes (on hover/focus/blur); required when using controlled `open` prop to observe state changes.",
    },
    children: {
      description: "The trigger element (button, icon, text) that the user hovers or focuses to show the tooltip; required.",
    },
    content: {
      description: "The text or content displayed inside the tooltip bubble; required.",
    },
    resizable: {
      description: "Controls whether the tooltip content can expand beyond the base width (93px to 140px); defaults to false if omitted.",
      control: "boolean",
    },
  },
  args: {
    children: (
      <button
        style={{
          padding: "8px 16px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Hover me
      </button>
    ),
    content: "Tooltip text",
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Top: Story = {
  args: {
    placement: "top",
    defaultOpen: true,
  },
};

export const TopStart: Story = {
  args: {
    placement: "top-start",
    defaultOpen: true,
  },
};

export const TopEnd: Story = {
  args: {
    placement: "top-end",
    defaultOpen: true,
  },
};

export const Bottom: Story = {
  args: {
    placement: "bottom",
    defaultOpen: true,
  },
};

export const BottomStart: Story = {
  args: {
    placement: "bottom-start",
    defaultOpen: true,
  },
};

export const BottomEnd: Story = {
  args: {
    placement: "bottom-end",
    defaultOpen: true,
  },
};

export const Left: Story = {
  args: {
    placement: "left",
    defaultOpen: true,
  },
};

export const LeftStart: Story = {
  args: {
    placement: "left-start",
    defaultOpen: true,
  },
};

export const LeftEnd: Story = {
  args: {
    placement: "left-end",
    defaultOpen: true,
  },
};

export const Right: Story = {
  args: {
    placement: "right",
    defaultOpen: true,
  },
};

export const RightStart: Story = {
  args: {
    placement: "right-start",
    defaultOpen: true,
  },
};

export const RightEnd: Story = {
  args: {
    placement: "right-end",
    defaultOpen: true,
  },
};

export const ResizableOff: Story = {
  args: {
    resizable: false,
    placement: "top",
    defaultOpen: true,
  },
};

export const ResizableOn: Story = {
  args: {
    resizable: true,
    placement: "top",
    defaultOpen: true,
  },
};

export const ResizableLeftStart: Story = {
  args: {
    resizable: true,
    placement: "left-start",
    defaultOpen: true,
  },
};

export const ResizableRightStart: Story = {
  args: {
    resizable: true,
    placement: "right-start",
    defaultOpen: true,
  },
};
