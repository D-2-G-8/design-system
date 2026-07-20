import type { Meta, StoryObj } from "@storybook/react";
import { WResize } from "./WResize";

const meta: Meta<typeof WResize> = {
  title: "Components/WResize",
  component: WResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof WResize>;

export const Default: Story = {};
