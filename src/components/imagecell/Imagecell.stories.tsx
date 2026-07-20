import type { Meta, StoryObj } from "@storybook/react";
import { Imagecell } from "./Imagecell";

const meta: Meta<typeof Imagecell> = {
  title: "Components/Imagecell",
  component: Imagecell,
  args: { isVisited: false },
};
export default meta;

type Story = StoryObj<typeof Imagecell>;

export const Default: Story = {};
export const Visited: Story = { args: { isVisited: true } };
