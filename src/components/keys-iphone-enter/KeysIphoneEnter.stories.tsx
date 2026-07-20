import type { Meta, StoryObj } from "@storybook/react";
import { KeysIphoneEnter } from "./KeysIphoneEnter";

const meta: Meta<typeof KeysIphoneEnter> = {
  title: "Components/KeysIphoneEnter",
  component: KeysIphoneEnter,
  args: { blueColor: false },
};
export default meta;

type Story = StoryObj<typeof KeysIphoneEnter>;

export const Default: Story = {};
export const BlueColorOn: Story = { args: { blueColor: true } };
