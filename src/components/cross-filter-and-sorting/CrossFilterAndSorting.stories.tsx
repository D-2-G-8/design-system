import type { Meta, StoryObj } from "@storybook/react";
import { CrossFilterAndSorting } from "./CrossFilterAndSorting";

const meta: Meta<typeof CrossFilterAndSorting> = {
  title: "Components/CrossFilterAndSorting",
  component: CrossFilterAndSorting,
  args: {
    hasSort: false,
    hasSearch: false,
    hasRange: false,
    hasVariants: false,
    isSearchFilled: false,
    isCheckedPreview: false,
    isReopened: false,
    hasNoResults: false,
  },
};
export default meta;

type Story = StoryObj<typeof CrossFilterAndSorting>;

export const Default: Story = {};

export const Sort: Story = {
  args: {
    hasSort: true,
  },
};

export const SortPlusSearch: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
  },
};

export const Range: Story = {
  args: {
    hasRange: true,
  },
};

export const SortPlusSearchFilled: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
    isSearchFilled: true,
  },
};

export const SortPlusSearchCheckedPreview: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
    isCheckedPreview: true,
  },
};

export const FilterReopened: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
    isReopened: true,
  },
};

export const SortPlusVariants: Story = {
  args: {
    hasSort: true,
    hasVariants: true,
  },
};

export const SortPlusSearchPlusVariants: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
    hasVariants: true,
  },
};

export const SortPlusNoResult: Story = {
  args: {
    hasSort: true,
    hasSearch: true,
    hasNoResults: true,
  },
};
