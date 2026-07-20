import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Components/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Category" },
    ],
    separator: "/",
  },
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {};

export const WithCustomSeparator: Story = {
  args: {
    separator: "›",
  },
};

export const SingleItem: Story = {
  args: {
    items: [{ label: "Home" }],
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Current Page" },
    ],
  },
};

export const LongPath: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Electronics", href: "/products/electronics" },
      { label: "Computers", href: "/products/electronics/computers" },
      { label: "Laptops", href: "/products/electronics/computers/laptops" },
      { label: "Gaming Laptops" },
    ],
  },
};

export const AllLinked: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Category", href: "/products/category" },
    ],
  },
};
