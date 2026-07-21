import type { Meta, StoryObj } from "@storybook/react";
import { Iconbutton as Component } from "./Iconbutton";

const PlusIcon = (
  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
  </svg>
);

const PlusIcon24 = (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/>
  </svg>
);

const meta: Meta<typeof Component> = {
  title: "Components/Iconbutton",
  component: Component,
  args: {
    icon: PlusIcon24,
    size: "40",
    appearance: "primary",
  },
  argTypes: {
    icon: {
      description: "The icon to display inside the button; must be sized correctly (24px for sizes 52/40, 16px for sizes 32/24).",
      control: false,
    },
    size: {
      description: "Button size in pixels; defaults to '40'.",
      control: { type: "select" },
      options: ["24", "32", "40", "52"],
    },
    appearance: {
      description: "Visual style of the button: 'primary' for solid black fill, 'secondary' for light gray fill, 'tertiary' for white/transparent fill; defaults to 'primary'.",
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
    },
    disabled: {
      description: "When true, the button is non-interactive and styled in a disabled state; defaults to false.",
      control: "boolean",
    },
    active: {
      description: "When true, the button shows the active/pressed state independent of mouse interaction; defaults to false.",
      control: "boolean",
    },
    badgeCount: {
      description: "Optional numeric badge to display in the top-right corner of the button; omit to hide the badge.",
      control: { type: "number" },
    },
    tooltipText: {
      description: "Optional tooltip text to show on hover; omit to hide the tooltip.",
      control: "text",
    },
    tooltipPosition: {
      description: "Position of the tooltip relative to the button; defaults to 'top'.",
      control: { type: "select" },
      options: ["top", "right", "bottom", "left"],
    },
    onClick: {
      description: "Click handler fired when the button is clicked and not disabled.",
      control: false,
    },
  },
  parameters: {
    docs: {
      description: {
        component: "Icon button component with hover and active states. Hover to see background changes (Primary: #292929, Secondary: #ebebeb, Tertiary: #f5f5f5). Active state can be controlled via the 'active' prop.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Primary: Story = {
  args: {
    appearance: "primary",
  },
};

export const Secondary: Story = {
  args: {
    appearance: "secondary",
  },
};

export const Tertiary: Story = {
  args: {
    appearance: "tertiary",
  },
};

export const Size24: Story = {
  args: {
    icon: PlusIcon,
    size: "24",
  },
};

export const Size32: Story = {
  args: {
    icon: PlusIcon,
    size: "32",
  },
};

export const Size52: Story = {
  args: {
    icon: PlusIcon24,
    size: "52",
  },
};

export const Hover: Story = {
  args: {
    icon: PlusIcon24,
    size: "52",
    appearance: "primary",
  },
  parameters: {
    docs: {
      description: {
        story: "Hover over this button to see the hover state with background color #292929. All buttons support hover interactions via CSS :hover pseudo-class.",
      },
    },
    pseudo: {
      hover: true,
    },
  },
};

export const Active: Story = {
  args: {
    icon: PlusIcon24,
    appearance: "primary",
    active: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Active state controlled via the 'active' prop. Primary uses same background as default, Secondary and Tertiary use black background with white icon.",
      },
    },
  },
};

export const ActiveSecondary: Story = {
  args: {
    icon: PlusIcon24,
    appearance: "secondary",
    active: true,
  },
};

export const ActiveTertiary: Story = {
  args: {
    icon: PlusIcon24,
    appearance: "tertiary",
    active: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithBadge: Story = {
  args: {
    badgeCount: 5,
  },
};

export const WithTooltip: Story = {
  args: {
    tooltipText: "Tooltip Text",
    tooltipPosition: "top",
  },
  parameters: {
    docs: {
      description: {
        story: "Hover over the button to see the tooltip appear.",
      },
    },
  },
};

export const SecondaryWithBadge: Story = {
  args: {
    appearance: "secondary",
    badgeCount: 3,
  },
};

export const TertiarySize52: Story = {
  args: {
    icon: PlusIcon24,
    appearance: "tertiary",
    size: "52",
  },
};

export const DisabledWithBadge: Story = {
  args: {
    disabled: true,
    badgeCount: 5,
  },
};