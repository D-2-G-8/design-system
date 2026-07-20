import type { Meta, StoryObj } from "@storybook/react";
import { Cell2 } from "./Cell2";

const meta: Meta<typeof Cell2> = {
  title: "Components/Cell2",
  component: Cell2,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Cell2>;

export const Default: Story = {};
