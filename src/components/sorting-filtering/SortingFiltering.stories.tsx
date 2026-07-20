import type { Meta, StoryObj } from "@storybook/react";
import { SortingFiltering } from "./SortingFiltering";

const meta: Meta<typeof SortingFiltering> = {
  title: "Components/SortingFiltering",
  component: SortingFiltering,
  args: {
    type: "sorting-filtering",
    direction: "not",
    state: "default",
  },
};
export default meta;

type Story = StoryObj<typeof SortingFiltering>;

export const Default: Story = {};

export const SortingFilteringAscend: Story = {
  args: {
    type: "sorting-filtering",
    direction: "ascend",
    state: "default",
  },
};

export const SortingFilteringDescend: Story = {
  args: {
    type: "sorting-filtering",
    direction: "descend",
    state: "default",
  },
};

export const SortingFilteringHover: Story = {
  args: {
    type: "sorting-filtering",
    direction: "not",
    state: "hover",
  },
};

export const SortingFilteringActive: Story = {
  args: {
    type: "sorting-filtering",
    direction: "ascend",
    state: "active",
  },
};

export const ChevronAscend: Story = {
  args: {
    type: "chevron",
    direction: "ascend",
    state: "default",
  },
};

export const ChevronDescend: Story = {
  args: {
    type: "chevron",
    direction: "descend",
    state: "default",
  },
};

export const ChevronHover: Story = {
  args: {
    type: "chevron",
    direction: "ascend",
    state: "hover",
  },
};

export const ChevronActive: Story = {
  args: {
    type: "chevron",
    direction: "descend",
    state: "active",
  },
};

export const Sorting: Story = {
  args: {
    type: "sorting",
    direction: "not",
    state: "default",
  },
};

export const SortingHover: Story = {
  args: {
    type: "sorting",
    direction: "not",
    state: "hover",
  },
};

export const SortingActive: Story = {
  args: {
    type: "sorting",
    direction: "not",
    state: "active",
  },
};

export const Filtering: Story = {
  args: {
    type: "filtering",
    direction: "not",
    state: "default",
  },
};

export const FilteringHover: Story = {
  args: {
    type: "filtering",
    direction: "not",
    state: "hover",
  },
};

export const FilteringActive: Story = {
  args: {
    type: "filtering",
    direction: "not",
    state: "active",
  },
};
