import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip as Component } from "./Tooltip";

const meta: Meta<typeof Component> = {
  title: "Components/Tooltip",
  component: Component,
  argTypes: {
    placement: {
      description:
        "Positions the tooltip relative to its anchor element; defaults to 'top' if omitted.",
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
      description:
        "Controlled visibility state; pass together with onOpenChange to drive tooltip visibility from the parent, or omit both to let the component manage its own hover/focus interactions.",
      control: "boolean",
    },
    defaultOpen: {
      description:
        "Initial visibility state when uncontrolled; ignored if open is provided, defaults to false.",
      control: "boolean",
    },
    resizable: {
      description:
        "Whether the tooltip can resize to accommodate wider content. When false, content is constrained to 93px width. When true, content can expand up to 140px. Defaults to false.",
      control: "boolean",
    },
    onOpenChange: {
      description:
        "Callback fired whenever the tooltip visibility changes, either via hover/focus or programmatic control; use with open to implement controlled mode.",
    },
  },
  args: {
    content: "Tooltip text",
    resizable: false,
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const Top: Story = {
  args: {
    placement: "top",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const TopStart: Story = {
  args: {
    placement: "top-start",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const TopEnd: Story = {
  args: {
    placement: "top-end",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const Bottom: Story = {
  args: {
    placement: "bottom",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const BottomStart: Story = {
  args: {
    placement: "bottom-start",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const BottomEnd: Story = {
  args: {
    placement: "bottom-end",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const Left: Story = {
  args: {
    placement: "left",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const LeftStart: Story = {
  args: {
    placement: "left-start",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const LeftEnd: Story = {
  args: {
    placement: "left-end",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const Right: Story = {
  args: {
    placement: "right",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const RightStart: Story = {
  args: {
    placement: "right-start",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const RightEnd: Story = {
  args: {
    placement: "right-end",
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const AlwaysOpen: Story = {
  args: {
    defaultOpen: true,
    content: "Tooltip text",
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};

export const Resizable: Story = {
  args: {
    placement: "top",
    content: "Tooltip text",
    resizable: true,
  },
  render: (args) => (
    <div style={{ padding: "100px", display: "flex", justifyContent: "center" }}>
      <Component {...args}>
        <button style={{ padding: "8px 16px", cursor: "pointer" }}>
          Hover me
        </button>
      </Component>
    </div>
  ),
};