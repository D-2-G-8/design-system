import type { Meta, StoryObj } from "@storybook/react";
import { Avatar as Component } from "./Avatar";

const meta: Meta<typeof Component> = {
  title: "Components/Avatar",
  component: Component,
  args: {
    size: 48,
    type: "text",
    squared: false,
    text: "VM",
    badge: false,
    editButton: false,
  },
  argTypes: {
    size: {
      description: "Avatar size in pixels; controls both the container dimensions and internal text/icon scaling, with 24 as the smallest and 96 as the largest.",
      control: { type: "select" },
      options: [24, 32, 40, 48, 64, 96],
    },
    type: {
      description: "Avatar content type: 'img' displays an image via the `src` prop, 'text' displays initials via the `text` prop, 'icon' displays an icon via the `icon` prop.",
      control: { type: "select" },
      options: ["img", "text", "icon"],
    },
    squared: {
      description: "When true, renders the avatar with squared corners (border-radius scales with size); when false or omitted, renders fully circular (border-radius 1000px).",
      control: "boolean",
    },
    src: {
      description: "Image URL to display when `type` is 'img'; ignored for text/icon types.",
      control: "text",
    },
    alt: {
      description: "Alt text for the image when `type` is 'img'; improves accessibility.",
      control: "text",
    },
    text: {
      description: "Initials or short text to display when `type` is 'text' (typically 1-2 uppercase characters); ignored for img/icon types.",
      control: "text",
    },
    icon: {
      description: "Icon component to render when `type` is 'icon'; pass a design-system icon instance; ignored for img/text types.",
      control: false,
    },
    badge: {
      description: "When true, renders a BadgeCount component in the bottom-right corner of the avatar; omit or pass false to hide the badge.",
      control: "boolean",
    },
    badgeValue: {
      description: "Numeric value to display in the badge when `badge` is true; ignored if badge is false or omitted.",
      control: "number",
    },
    editButton: {
      description: "When true (and size >= 48px), renders an IconButton overlay in the bottom-right corner for editing; omit or pass false to hide the edit button. Note: Only renders when size is 48px or larger.",
      control: "boolean",
    },
    className: {
      description: "Additional CSS class name(s) to apply to the outermost avatar container for custom styling or layout integration.",
      control: "text",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const Size24Text: Story = {
  args: {
    size: 24,
    type: "text",
    text: "VM",
    squared: false,
  },
};

export const Size24TextSquared: Story = {
  args: {
    size: 24,
    type: "text",
    text: "VM",
    squared: true,
  },
};

export const Size32Text: Story = {
  args: {
    size: 32,
    type: "text",
    text: "VM",
    squared: false,
  },
};

export const Size64Text: Story = {
  args: {
    size: 64,
    type: "text",
    text: "VM",
    squared: false,
  },
};

export const Size96Text: Story = {
  args: {
    size: 96,
    type: "text",
    text: "VM",
    squared: false,
  },
};

export const Size96TextSquared: Story = {
  args: {
    size: 96,
    type: "text",
    text: "VM",
    squared: true,
  },
};

export const ImageAvatar: Story = {
  args: {
    size: 64,
    type: "img",
    src: "https://i.pravatar.cc/150?img=1",
    alt: "User avatar",
    squared: false,
  },
};

export const ImageAvatarSquared: Story = {
  args: {
    size: 64,
    type: "img",
    src: "https://i.pravatar.cc/150?img=2",
    alt: "User avatar",
    squared: true,
  },
};

export const IconAvatar: Story = {
  args: {
    size: 48,
    type: "icon",
    squared: false,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
};

export const IconAvatarSquared: Story = {
  args: {
    size: 48,
    type: "icon",
    squared: true,
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
};

export const WithBadge: Story = {
  args: {
    size: 48,
    type: "text",
    text: "VM",
    squared: false,
    badge: true,
    badgeValue: 5,
  },
};

export const WithEditButton: Story = {
  args: {
    size: 96,
    type: "img",
    src: "https://i.pravatar.cc/150?img=3",
    alt: "User avatar",
    squared: false,
    editButton: true,
  },
};

export const WithEditButtonSquared: Story = {
  args: {
    size: 64,
    type: "text",
    text: "VM",
    squared: true,
    editButton: true,
  },
};

export const AllFeatures: Story = {
  args: {
    size: 96,
    type: "img",
    src: "https://i.pravatar.cc/150?img=4",
    alt: "User avatar",
    squared: false,
    badge: true,
    badgeValue: 5,
    editButton: true,
  },
};
