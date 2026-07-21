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
    withBadge: false,
    withEditButton: false,
  },
  argTypes: {
    size: {
      description: "Avatar size in pixels, controlling both the container dimensions and the internal content (image, text, or icon) scaling; defaults to '48' if omitted.",
      control: { type: "select" },
      options: ["24", "32", "40", "48", "64", "96"],
    },
    type: {
      description: "Content type displayed inside the avatar: 'img' for a user image, 'text' for initials, or 'icon' for a generic profile icon; defaults to 'img'.",
      control: { type: "select" },
      options: ["img", "text", "icon"],
    },
    squared: {
      description: "When true, applies a moderately rounded square border-radius (proportional to size); when false, applies a fully circular border-radius; defaults to false for circular avatars.",
      control: "boolean",
    },
    src: {
      description: "Image source URL; required when type='img', ignored for other types.",
      control: "text",
    },
    alt: {
      description: "Accessible alt text for the image; required when type='img' to describe the user for screen readers, ignored for other types.",
      control: "text",
    },
    text: {
      description: "Text content (typically user initials like 'VM') displayed when type='text'; required for text type, ignored otherwise.",
      control: "text",
    },
    icon: {
      description: "Custom icon component or element rendered when type='icon'; if omitted for icon type, a default profile icon is shown.",
      control: false,
    },
    withBadge: {
      description: "When true, renders a badge count overlay in the bottom-right corner; defaults to false, hiding the badge entirely.",
      control: "boolean",
    },
    badgeValue: {
      description: "Numeric value displayed in the badge overlay; only rendered when withBadge is true, otherwise ignored.",
      control: "number",
    },
    withEditButton: {
      description: "When true, renders an edit icon button overlay (48px and larger sizes only); defaults to false, hiding the edit button.",
      control: "boolean",
    },
    onEditClick: {
      description: "Callback fired when the edit button is clicked; only applies when withEditButton is true, otherwise ignored.",
      control: false,
    },
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

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

export const TextInitials: Story = {
  args: {
    type: "text",
    text: "ВМ",
  },
};

export const TextInitialsSquared: Story = {
  args: {
    type: "text",
    text: "ВМ",
    squared: true,
  },
};

export const IconType: Story = {
  args: {
    type: "icon",
  },
};

export const IconTypeSquared: Story = {
  args: {
    type: "icon",
    squared: true,
  },
};

export const Squared: Story = {
  args: {
    squared: true,
  },
};

export const WithBadge: Story = {
  args: {
    withBadge: true,
    badgeValue: 5,
  },
};

export const WithEditButton: Story = {
  args: {
    withEditButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const WithBadgeAndEdit: Story = {
  args: {
    withBadge: true,
    badgeValue: 5,
    withEditButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const Large96WithAllFeatures: Story = {
  args: {
    size: "96",
    withBadge: true,
    badgeValue: 5,
    withEditButton: true,
    squared: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};

export const TextSmall24: Story = {
  args: {
    size: "24",
    type: "text",
    text: "ВМ",
    withBadge: true,
    badgeValue: 5,
  },
};

export const IconLarge64: Story = {
  args: {
    size: "64",
    type: "icon",
    withBadge: true,
    badgeValue: 5,
    withEditButton: true,
    onEditClick: () => console.log("Edit clicked"),
  },
};