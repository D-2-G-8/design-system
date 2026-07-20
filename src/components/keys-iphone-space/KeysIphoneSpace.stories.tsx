import type { Meta, StoryObj } from "@storybook/react";
import { KeysIphoneSpace } from "./KeysIphoneSpace";

const meta: Meta<typeof KeysIphoneSpace> = {
  title: "Components/KeysIphoneSpace",
  component: KeysIphoneSpace,
  args: { config: "default" },
};
export default meta;

type Story = StoryObj<typeof KeysIphoneSpace>;

export const Default: Story = {};
