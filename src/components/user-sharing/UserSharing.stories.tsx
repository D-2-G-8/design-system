import type { Meta, StoryObj } from "@storybook/react";
import { UserSharing } from "./UserSharing";

const meta: Meta<typeof UserSharing> = {
  title: "Components/UserSharing",
  component: UserSharing,
  args: {},
};
export default meta;

type Story = StoryObj<typeof UserSharing>;

export const Default: Story = {};
