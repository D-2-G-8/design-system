import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./Table";

const meta: Meta<typeof Table> = {
  title: "Components/Table",
  component: Table,
  args: {
    showCaption: true,
    showHeader: true,
    showFooter: true,
  },
};
export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {};

export const WithCaptionHeaderAndFooter: Story = {
  args: {
    showCaption: true,
    showHeader: true,
    showFooter: true,
  },
};

export const WithoutCaption: Story = {
  args: {
    showCaption: false,
    showHeader: true,
    showFooter: true,
  },
};

export const WithoutFooter: Story = {
  args: {
    showCaption: true,
    showHeader: true,
    showFooter: false,
  },
};

export const WithoutHeader: Story = {
  args: {
    showCaption: true,
    showHeader: false,
    showFooter: true,
  },
};

export const BodyOnly: Story = {
  args: {
    showCaption: false,
    showHeader: false,
    showFooter: false,
  },
};
