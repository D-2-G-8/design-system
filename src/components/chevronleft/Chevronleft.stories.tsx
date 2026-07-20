import type { Meta, StoryObj } from "@storybook/react";
import { Chevronleft } from "./Chevronleft";

const meta: Meta<typeof Chevronleft> = {
  title: "Components/Chevronleft",
  component: Chevronleft,
  args: { type: "basic" },
};
export default meta;

type Story = StoryObj<typeof Chevronleft>;

export const Default: Story = {};
export const Basic: Story = { args: { type: "basic" } };
