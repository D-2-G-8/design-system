import type { Meta, StoryObj } from "@storybook/react";
import { Cursor } from "./Cursor";

const meta: Meta<typeof Cursor> = {
  title: "Components/Cursor",
  component: Cursor,
  args: {
    step: true,
    variant: "default",
  },
};
export default meta;

type Story = StoryObj<typeof Cursor>;

export const Default: Story = {};

export const StepOff: Story = {
  args: {
    step: false,
  },
};

export const NotAllowed: Story = {
  args: {
    variant: "not-allowed",
  },
};

export const Pointer: Story = {
  args: {
    variant: "pointer",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
  },
};

export const VerticalText: Story = {
  args: {
    variant: "vertical-text",
  },
};

export const Crosshair: Story = {
  args: {
    variant: "crosshair",
  },
};

export const Cell: Story = {
  args: {
    variant: "cell",
  },
};

export const Move: Story = {
  args: {
    variant: "move",
  },
};

export const Grab: Story = {
  args: {
    variant: "grab",
  },
};

export const Grabbing: Story = {
  args: {
    variant: "grabbing",
  },
};

export const Copy: Story = {
  args: {
    variant: "copy",
  },
};

export const Alias: Story = {
  args: {
    variant: "alias",
  },
};

export const NoDrop: Story = {
  args: {
    variant: "no-drop",
  },
};

export const ZoomIn: Story = {
  args: {
    variant: "zoom-in",
  },
};

export const ZoomOut: Story = {
  args: {
    variant: "zoom-out",
  },
};

export const NResize: Story = {
  args: {
    variant: "n-resize",
  },
};

export const EResize: Story = {
  args: {
    variant: "e-resize",
  },
};

export const SResize: Story = {
  args: {
    variant: "s-resize",
  },
};

export const WResize: Story = {
  args: {
    variant: "w-resize",
  },
};

export const NEResize: Story = {
  args: {
    variant: "ne-resize",
  },
};

export const NWResize: Story = {
  args: {
    variant: "nw-resize",
  },
};

export const SEResize: Story = {
  args: {
    variant: "se-resize",
  },
};

export const SWResize: Story = {
  args: {
    variant: "sw-resize",
  },
};

export const EWResize: Story = {
  args: {
    variant: "ew-resize",
  },
};

export const NSResize: Story = {
  args: {
    variant: "ns-resize",
  },
};

export const NESWResize: Story = {
  args: {
    variant: "nesw-resize",
  },
};

export const NWSEResize: Story = {
  args: {
    variant: "nwse-resize",
  },
};

export const ColResize: Story = {
  args: {
    variant: "col-resize",
  },
};

export const RowResize: Story = {
  args: {
    variant: "row-resize",
  },
};

export const Progress: Story = {
  args: {
    variant: "progress",
  },
};

export const Help: Story = {
  args: {
    variant: "help",
  },
};

export const ContextMenu: Story = {
  args: {
    variant: "context-menu",
  },
};
