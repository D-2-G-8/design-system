import type { Meta, StoryObj } from "@storybook/react";
import { IosStatusBar } from "./IosStatusBar";

const meta: Meta<typeof IosStatusBar> = {
  title: "Components/IosStatusBar",
  component: IosStatusBar,
  args: {
    device: "X",
    cardStack: "off",
  },
};
export default meta;

type Story = StoryObj<typeof IosStatusBar>;

export const Default: Story = {};
