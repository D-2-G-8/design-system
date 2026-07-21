import type { Meta, StoryObj } from "@storybook/react";
import { Avatar as Component } from "./Avatar";

const meta: Meta<typeof Component> = {
  title: "Components/Avatar",
  component: Component,
  args: {
    size: "48",
    type: "img",
    squared: false,
    src: "https://i.pravatar.cc/96",
    alt: "User avatar",
    badge: false,
    editButton: false,
    badgeValue: 5,
  },
  argTypes: {
    size: {
      description:
        "Avatar size in pixels; controls container dimensions, text/icon scaling, and badge/edit-button sizing. Defaults to '48' when omitted.",
      control: { type: "select" },
      options: ["24", "32", "40", "48", "64", "96"],
    },
    type: {
      description:
        "Content type: 'img' for an image source, 'text' for initials/letters, or 'icon' for a custom icon. Determines which content is rendered and which fallback background applies.",
      control: { type: "select" },
      options: ["img", "text", "icon"],
    },
    squared: {
      description:
        "When true, uses rounded-square corners (radius-6 to radius-32 depending on size); when false or omitted, uses fully circular (radius-1000) shape.",
      control: "boolean",
    },
    src: {
      description:
        "Image URL when type='img'; rendered as the avatar's background or img element. Only used when type='img'.",
    },
    alt: {
      description:
        "Alt text for the image when type='img'; required for accessibility when src is provided. Only used when type='img'.",
    },
    textValue: {
      description:
        "Initials or short text (e.g. 'ВМ') when type='text'; displayed centered on the new-style-base-1 background. Only used when type='text'.",
    },
    icon: {
      description:
        "Custom icon component when type='icon'; if omitted, falls back to FillProfile2. Only used when type='icon'.",
    },
    badge: {
      description:
        "When true, displays a badge in the bottom-right corner. Defaults to false.",
      control: "boolean",
    },
    badgeValue: {
      description:
        "Badge value to display; passed to the Badgecount component. Only used when badge is true. Defaults to 5 if omitted.",
      control: "number",
    },
    editButton: {
      description:
        "When true, displays an edit button in the bottom-right corner (only for sizes 48px and above). Defaults to false.",
      control: "boolean",
    },
    onEditClick: {
      description:
        "Click handler for the edit button when present; called when the user clicks the edit icon.",
    },
    className: {
      description:
        "Additional CSS class name(s) appended to the root container for custom styling. Merged with internal size/type/squared classes.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const TextInitials: Story = {
  args: {
    type: "text",
    textValue: "ВМ",
    src: undefined,
  },
};

export const IconType: Story = {
  args: {
    type: "icon",
    src: undefined,
  },
};

export const WithBadge: Story = {
  args: {
    badge: true,
    badgeValue: 3,
  },
};

export const WithEditButton: Story = {
  args: {
    size: "64",
    editButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const Squared: Story = {
  args: {
    squared: true,
  },
};

export const Size24: Story = {
  args: {
    size: "24",
  },
};

export const Size32: Story = {
  args: {
    size: "32",
  },
};

export const Size40: Story = {
  args: {
    size: "40",
  },
};

export const Size64: Story = {
  args: {
    size: "64",
  },
};

export const Size96: Story = {
  args: {
    size: "96",
  },
};

export const TextSquared: Story = {
  args: {
    type: "text",
    textValue: "ВМ",
    squared: true,
    src: undefined,
  },
};

export const IconSquared: Story = {
  args: {
    type: "icon",
    squared: true,
    src: undefined,
  },
};

export const LargeWithAllFeatures: Story = {
  args: {
    size: "96",
    badge: true,
    editButton: true,
    badgeValue: 9,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const TextLarge: Story = {
  args: {
    type: "text",
    textValue: "ВМ",
    size: "64",
    src: undefined,
  },
};