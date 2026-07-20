import type { Meta, StoryObj } from "@storybook/react";
import { NResize } from "./NResize";

const meta: Meta<typeof NResize> = {
  title: "Components/NResize",
  component: NResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NResize>;

export const Default: Story = {};
