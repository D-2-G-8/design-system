import type { Meta, StoryObj } from "@storybook/react";
import { Table2 } from "./Table2";

const meta: Meta<typeof Table2> = {
  title: "Components/Table2",
  component: Table2,
  args: {
    caption: true,
    showHeader: true,
    showFooter: true,
  },
};
export default meta;

type Story = StoryObj<typeof Table2>;

export const Default: Story = {};

export const WithoutCaption: Story = {
  args: {
    caption: false,
  },
};

export const WithoutHeader: Story = {
  args: {
    showHeader: false,
  },
};

export const WithoutFooter: Story = {
  args: {
    showFooter: false,
  },
};

export const MinimalTable: Story = {
  args: {
    caption: false,
    showHeader: false,
    showFooter: false,
  },
};
