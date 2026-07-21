import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip as Component } from "./Tooltip";

const meta: Meta<typeof Component> = {
  title: "Components/Tooltip",
  component: Component,
  args: {
    placement: "top",
    resizable: false,
    children: "Tooltip text",
  },
  argTypes: {
    placement: {
      control: "select",
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
    resizable: {
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Top: Story = {
  args: {
    placement: "top",
    resizable: false,
  },
};

export const TopStart: Story = {
  args: {
    placement: "top-start",
    resizable: false,
  },
};

export const TopEnd: Story = {
  args: {
    placement: "top-end",
    resizable: false,
  },
};

export const Bottom: Story = {
  args: {
    placement: "bottom",
    resizable: false,
  },
};

export const BottomStart: Story = {
  args: {
    placement: "bottom-start",
    resizable: false,
  },
};

export const BottomEnd: Story = {
  args: {
    placement: "bottom-end",
    resizable: false,
  },
};

export const Left: Story = {
  args: {
    placement: "left",
    resizable: false,
  },
};

export const LeftStart: Story = {
  args: {
    placement: "left-start",
    resizable: false,
  },
};

export const LeftEnd: Story = {
  args: {
    placement: "left-end",
    resizable: false,
  },
};

export const Right: Story = {
  args: {
    placement: "right",
    resizable: false,
  },
};

export const RightStart: Story = {
  args: {
    placement: "right-start",
    resizable: false,
  },
};

export const RightEnd: Story = {
  args: {
    placement: "right-end",
    resizable: false,
  },
};

export const Resizable: Story = {
  args: {
    placement: "top",
    resizable: true,
    children: "Tooltip text",
  },
};

export const ResizableLeft: Story = {
  args: {
    placement: "left",
    resizable: true,
    children: "Tooltip text",
  },
};

export const ResizableBottom: Story = {
  args: {
    placement: "bottom",
    resizable: true,
    children: "Tooltip text",
  },
};
