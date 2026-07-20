import type { Meta, StoryObj } from "@storybook/react";
import { KeyboardIphoneLayouts } from "./KeyboardIphoneLayouts";

const meta: Meta<typeof KeyboardIphoneLayouts> = {
  title: "Components/KeyboardIphoneLayouts",
  component: KeyboardIphoneLayouts,
  args: { type: "letters-lowercase" },
};
export default meta;

type Story = StoryObj<typeof KeyboardIphoneLayouts>;

export const Default: Story = {};
export const LettersLowercase: Story = { args: { type: "letters-lowercase" } };
