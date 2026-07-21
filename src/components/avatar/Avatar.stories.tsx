import type { Meta, StoryObj } from "@storybook/react";
import { Avatar as Component } from "./Avatar";

const meta: Meta<typeof Component> = {
  title: "Components/Avatar",
  component: Component,
  args: {
    size: 48,
    type: "text",
    text: "BM",
    squared: false,
    withBadge: false,
    badgeValue: 5,
    withEditButton: false,
  },
  argTypes: {
    size: {
      description: "Avatar size in pixels; determines container dimensions, corner radius, and icon/text scale. Defaults to 48.",
      control: { type: "select" },
      options: [24, 32, 40, 48, 64, 96],
    },
    type: {
      description: "Content type: 'img' for image URLs, 'text' for initials/letters, 'icon' for icon components. Pass together with the corresponding content prop (src/alt for img, text for text, icon for icon).",
      control: { type: "select" },
      options: ["img", "text", "icon"],
    },
    src: {
      description: "Image URL when type='img'; required for img avatars, ignored otherwise.",
    },
    alt: {
      description: "Alt text for the image when type='img'; required for accessibility when using img avatars.",
    },
    text: {
      description: "Text content (typically initials like 'BM') when type='text'; required for text avatars, ignored otherwise.",
    },
    icon: {
      description: "Icon component to render when type='icon'; swaps out the default FillProfile2 icon when provided.",
    },
    squared: {
      description: "Whether to use squared corners (radius-6/8/10/12/16/32 depending on size) instead of fully rounded (radius-1000). Defaults to false (rounded).",
      control: "boolean",
    },
    withBadge: {
      description: "Whether to show the notification badge in the bottom-right corner; controls badge visibility. Use badgeValue prop to set the badge number. Defaults to false.",
      control: "boolean",
    },
    badgeValue: {
      description: "Numeric value to display in the badge; only visible when withBadge is true.",
      control: "number",
    },
    withEditButton: {
      description: "Whether to show the edit icon button overlay (48px+ sizes only); pass true to display the button, false or omit to hide it. Defaults to false.",
      control: "boolean",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const TextInitials: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 48,
  },
};

export const TextInitialsSquared: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 48,
    squared: true,
  },
};

export const ImageAvatar: Story = {
  args: {
    type: "img",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
    size: 48,
  },
};

export const ImageAvatarSquared: Story = {
  args: {
    type: "img",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
    size: 48,
    squared: true,
  },
};

export const IconAvatar: Story = {
  args: {
    type: "icon",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    size: 48,
  },
};

export const IconAvatarSquared: Story = {
  args: {
    type: "icon",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
    size: 48,
    squared: true,
  },
};

export const WithBadge: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 48,
    withBadge: true,
    badgeValue: 5,
  },
};

export const WithEditButton: Story = {
  args: {
    type: "img",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
    size: 64,
    withEditButton: true,
  },
};

export const WithBadgeAndEditButton: Story = {
  args: {
    type: "img",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop",
    alt: "User avatar",
    size: 96,
    withBadge: true,
    badgeValue: 5,
    withEditButton: true,
  },
};

export const Size24: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 24,
  },
};

export const Size32: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 32,
  },
};

export const Size40: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 40,
  },
};

export const Size64: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 64,
  },
};

export const Size96: Story = {
  args: {
    type: "text",
    text: "BM",
    size: 96,
  },
};