import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip as Component } from "./Tooltip";

const meta: Meta<typeof Component> = {
  title: "Components/Tooltip",
  component: Component,
  args: {
    children: "Tooltip text",
    placement: "top",
    trigger: <button>Hover me</button>,
    resizable: false,
    isMobile: false,
  },
  argTypes: {
    placement: {
      description: "Controls the position of the tooltip relative to its trigger element; defaults to 'top' if omitted.",
      control: { type: "select" },
      options: [
        "top",
        "topStart",
        "topEnd",
        "bottom",
        "bottomStart",
        "bottomEnd",
        "left",
        "leftStart",
        "leftEnd",
        "right",
        "rightStart",
        "rightEnd",
      ],
    },
    children: {
      description: "The content to display inside the tooltip; typically a short text string but can be any renderable React node.",
    },
    open: {
      description: "Controlled open state; pass together with onOpenChange to drive visibility from the parent, or omit both to let the component manage its own open/closed state based on hover/focus.",
      control: "boolean",
    },
    defaultOpen: {
      description: "Initial open state when uncontrolled; ignored if open is provided, defaults to false.",
      control: "boolean",
    },
    onOpenChange: {
      description: "Callback fired whenever the tooltip's visibility changes, receiving the new open state; use with open prop for controlled mode or omit for uncontrolled.",
    },
    trigger: {
      description: "The trigger element that the tooltip is attached to; the tooltip will position itself relative to this element.",
    },
    resizable: {
      description: "Controls whether the tooltip content is resizable (wider); when true applies wider width (140px vs 93px), defaults to false.",
      control: "boolean",
    },
    isMobile: {
      description: "Switches to mobile variant with different typography and padding; uses TT Norms font, 16px/22px line-height, and 10px vertical padding, defaults to false.",
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const TopStart: Story = {
  args: {
    placement: "topStart",
  },
};

export const TopEnd: Story = {
  args: {
    placement: "topEnd",
  },
};

export const Bottom: Story = {
  args: {
    placement: "bottom",
  },
};

export const BottomStart: Story = {
  args: {
    placement: "bottomStart",
  },
};

export const BottomEnd: Story = {
  args: {
    placement: "bottomEnd",
  },
};

export const Left: Story = {
  args: {
    placement: "left",
  },
};

export const LeftStart: Story = {
  args: {
    placement: "leftStart",
  },
};

export const LeftEnd: Story = {
  args: {
    placement: "leftEnd",
  },
};

export const Right: Story = {
  args: {
    placement: "right",
  },
};

export const RightStart: Story = {
  args: {
    placement: "rightStart",
  },
};

export const RightEnd: Story = {
  args: {
    placement: "rightEnd",
  },
};

export const AlwaysOpen: Story = {
  args: {
    defaultOpen: true,
  },
};

export const Resizable: Story = {
  args: {
    resizable: true,
  },
};

export const Mobile: Story = {
  args: {
    isMobile: true,
    children: "Tooltip Text",
  },
};