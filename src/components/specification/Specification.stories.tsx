import type { Meta, StoryObj } from "@storybook/react";
import { Specification } from "./Specification";

const meta: Meta<typeof Specification> = {
  title: "Components/Specification",
  component: Specification,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Specification>;

export const Default: Story = {};
