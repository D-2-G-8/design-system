import type { Meta, StoryObj } from "@storybook/react";
import { NwResize } from "./NwResize";

const meta: Meta<typeof NwResize> = {
  title: "Components/NwResize",
  component: NwResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NwResize>;

export const Default: Story = {};
