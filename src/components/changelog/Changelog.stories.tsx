import type { Meta, StoryObj } from "@storybook/react";
import { Changelog } from "./Changelog";

const meta: Meta<typeof Changelog> = {
  title: "Components/Changelog",
  component: Changelog,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Changelog>;

export const Default: Story = {};
