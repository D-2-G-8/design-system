import type { Meta, StoryObj } from "@storybook/react";
import { Avatar as Component } from "./Avatar";
import { FillProfile2 } from "../../icons/fill-profile2";

const meta: Meta<typeof Component> = {
  title: "Components/Avatar",
  component: Component,
  args: {
    size: "48",
    type: "img",
    square: false,
    badge: false,
    editButton: false,
  },
  argTypes: {
    size: {
      description: "Size of the avatar in pixels; defaults to '48' if omitted.",
      control: { type: "select" },
      options: ["24", "32", "40", "48", "64", "96"],
    },
    type: {
      description: "Display mode: 'img' renders an image, 'text' shows initials or custom text, 'icon' renders a fallback icon; defaults to 'img' if omitted.",
      control: { type: "select" },
      options: ["img", "text", "icon"],
    },
    square: {
      description: "Whether the avatar uses a rounded square shape instead of a circle; pass true for square corners, omit or pass false for fully rounded circle.",
      control: "boolean",
    },
    src: {
      description: "Image source URL when type is 'img'; required for type='img', ignored for other types.",
    },
    alt: {
      description: "Accessible alt text for the image when type is 'img'; recommended for accessibility, ignored for other types.",
    },
    text: {
      description: "Text content (typically initials) when type is 'text'; required for type='text', ignored for other types.",
    },
    icon: {
      description: "Icon element to render when type is 'icon'; pass a design-system icon component instance, ignored for other types.",
    },
    badge: {
      description: "Whether to show a badge overlay in the bottom-right corner; pass true to render the badge, omit or pass false to hide it.",
      control: "boolean",
    },
    badgeCount: {
      description: "Count value to display in the badge when badge is true; passed to the Badgecount component, ignored if badge is false.",
    },
    editButton: {
      description: "Whether to show an edit icon button overlay (sizes 48px and above); pass true to render the button, omit or pass false to hide it.",
      control: "boolean",
    },
    onEditClick: {
      description: "Callback fired when the edit button is clicked; only relevant when editButton is true.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
  },
};

export const Size24: Story = {
  args: {
    size: "24",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=24&h=24&fit=crop",
    alt: "User avatar",
  },
};

export const Size32: Story = {
  args: {
    size: "32",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop",
    alt: "User avatar",
  },
};

export const Size64: Story = {
  args: {
    size: "64",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
    alt: "User avatar",
  },
};

export const Size96: Story = {
  args: {
    size: "96",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
  },
};

export const TextInitials: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: "48",
  },
};

export const TextInitialsSquare: Story = {
  args: {
    type: "text",
    text: "ВМ",
    size: "48",
    square: true,
  },
};

export const Icon: Story = {
  args: {
    type: "icon",
    size: "48",
    icon: <FillProfile2 />,
  },
};

export const IconSquare: Story = {
  args: {
    type: "icon",
    size: "48",
    square: true,
    icon: <FillProfile2 />,
  },
};

export const Square: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop",
    alt: "User avatar",
    square: true,
  },
};

export const WithBadge: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop",
    alt: "User avatar",
    badge: true,
    badgeCount: 5,
  },
};

export const WithEditButton: Story = {
  args: {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop",
    alt: "User avatar",
    editButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const WithBadgeAndEdit: Story = {
  args: {
    size: "64",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop",
    alt: "User avatar",
    badge: true,
    badgeCount: 5,
    editButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const Large96Square: Story = {
  args: {
    size: "96",
    type: "text",
    text: "ВМ",
    square: true,
    badge: true,
    badgeCount: 5,
    editButton: true,
  },
};