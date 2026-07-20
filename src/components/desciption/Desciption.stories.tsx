import type { Meta, StoryObj } from "@storybook/react";
import { Desciption } from "./Desciption";

const meta: Meta<typeof Desciption> = {
  title: "Components/Desciption",
  component: Desciption,
  args: {
    property1: "checkFileNames",
  },
};
export default meta;

type Story = StoryObj<typeof Desciption>;

export const Default: Story = {};

export const CheckFileNames: Story = {
  args: {
    property1: "checkFileNames",
  },
};

export const SortFiles: Story = {
  args: {
    property1: "sortFiles",
  },
};

export const ReserveSpace: Story = {
  args: {
    property1: "reserveSpace",
  },
};

export const RememberHow: Story = {
  args: {
    property1: "rememberHow",
  },
};
