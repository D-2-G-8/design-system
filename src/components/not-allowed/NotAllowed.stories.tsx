import type { Meta, StoryObj } from "@storybook/react";
import { NotAllowed } from "./NotAllowed";

const meta: Meta<typeof NotAllowed> = {
  title: "Components/NotAllowed",
  component: NotAllowed,
  args: {},
};
export default meta;

type Story = StoryObj<typeof NotAllowed>;

export const Default: Story = {};
