import type { Meta, StoryObj } from "@storybook/react";
import { TbodyCell } from "./TbodyCell";

const meta: Meta<typeof TbodyCell> = {
  title: "Components/TbodyCell",
  component: TbodyCell,
  args: {
    type: "stringFilled",
  },
};
export default meta;

type Story = StoryObj<typeof TbodyCell>;

export const Default: Story = {};

export const RowControl: Story = {
  args: {
    type: "rowControl",
  },
};

export const StringFilled: Story = {
  args: {
    type: "stringFilled",
  },
};

export const Control: Story = {
  args: {
    type: "control",
  },
};

export const LinkString: Story = {
  args: {
    type: "linkString",
  },
};

export const NumberEmpty: Story = {
  args: {
    type: "numberEmpty",
  },
};

export const SelectorStringFilled: Story = {
  args: {
    type: "selectorStringFilled",
  },
};

export const Image: Story = {
  args: {
    type: "image",
  },
};

export const NumberFilled: Story = {
  args: {
    type: "numberFilled",
  },
};

export const LinkNumber: Story = {
  args: {
    type: "linkNumber",
  },
};

export const VisitedNumber: Story = {
  args: {
    type: "visitedNumber",
  },
};

export const VisitedString: Story = {
  args: {
    type: "visitedString",
  },
};

export const TableHeader: Story = {
  args: {
    type: "tableHeader",
  },
};
