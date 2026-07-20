import type { Meta, StoryObj } from "@storybook/react";
import { NsResize } from "./NsResize";

const meta: Meta<typeof NsResize> = {
  title: "Components/NsResize",
  component: NsResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NsResize>;

export const Default: Story = {};
