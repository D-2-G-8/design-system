import type { Meta, StoryObj } from "@storybook/react";
import { Footer } from "./Footer";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  args: {
    breakpoint: "desktop",
    size: "maxi",
    isOpen: true,
  },
};
export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const Mobile: Story = {
  args: {
    breakpoint: "mobile",
  },
};

export const Tablet: Story = {
  args: {
    breakpoint: "tablet",
  },
};

export const Desktop: Story = {
  args: {
    breakpoint: "desktop",
  },
};

export const Mini: Story = {
  args: {
    size: "mini",
  },
};

export const Maxi: Story = {
  args: {
    size: "maxi",
  },
};

export const Closed: Story = {
  args: {
    isOpen: false,
  },
};

export const MobileMini: Story = {
  args: {
    breakpoint: "mobile",
    size: "mini",
  },
};

export const MobileMaxi: Story = {
  args: {
    breakpoint: "mobile",
    size: "maxi",
  },
};

export const TabletMini: Story = {
  args: {
    breakpoint: "tablet",
    size: "mini",
  },
};

export const DesktopMini: Story = {
  args: {
    breakpoint: "desktop",
    size: "mini",
  },
};

export const MobileClosed: Story = {
  args: {
    breakpoint: "mobile",
    isOpen: false,
  },
};
