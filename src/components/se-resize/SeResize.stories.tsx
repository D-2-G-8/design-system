import type { Meta, StoryObj } from "@storybook/react";
import { SeResize } from "./SeResize";

const meta: Meta<typeof SeResize> = {
  title: "Components/SeResize",
  component: SeResize,
  args: {},
};
export default meta;

type Story = StoryObj<typeof SeResize>;

export const Default: Story = {};
