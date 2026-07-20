import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Components/Tooltip",
  component: Tooltip,
  args: {
    placement: "bottom",
    resizable: false,
    theme: "dark",
    mobile: false,
    children: "Hover me",
    content: "This is a tooltip",
  },
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

export const Top: Story = {
  args: {
    placement: "top",
  },
};

export const Right: Story = {
  args: {
    placement: "right",
  },
};

export const Left: Story = {
  args: {
    placement: "left",
  },
};

export const TopStart: Story = {
  args: {
    placement: "top-start",
  },
};

export const TopEnd: Story = {
  args: {
    placement: "top-end",
  },
};

export const BottomStart: Story = {
  args: {
    placement: "bottom-start",
  },
};

export const BottomEnd: Story = {
  args: {
    placement: "bottom-end",
  },
};

export const LeftStart: Story = {
  args: {
    placement: "left-start",
  },
};

export const LeftEnd: Story = {
  args: {
    placement: "left-end",
  },
};

export const RightStart: Story = {
  args: {
    placement: "right-start",
  },
};

export const RightEnd: Story = {
  args: {
    placement: "right-end",
  },
};

export const Resizable: Story = {
  args: {
    resizable: true,
  },
};

export const LightTheme: Story = {
  args: {
    theme: "light",
  },
};

export const Mobile: Story = {
  args: {
    mobile: true,
  },
};

export const LightThemeMobile: Story = {
  args: {
    theme: "light",
    mobile: true,
  },
};

export const ResizableRight: Story = {
  args: {
    placement: "right",
    resizable: true,
  },
};
