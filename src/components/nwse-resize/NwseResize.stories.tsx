import type { Meta, StoryObj } from "@storybook/react";
import { NwseResize } from "./NwseResize";

const meta: Meta<typeof NwseResize> = {
  title: "Components/NwseResize",
  component: NwseResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NwseResize>;

export const Default: Story = {};
