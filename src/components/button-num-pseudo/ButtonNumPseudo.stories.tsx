import type { Meta, StoryObj } from "@storybook/react";
import { ButtonNumPseudo } from "./ButtonNumPseudo";

const meta: Meta<typeof ButtonNumPseudo> = {
  title: "Components/ButtonNumPseudo",
  component: ButtonNumPseudo,
  args: { active: false },
};
export default meta;

type Story = StoryObj<typeof ButtonNumPseudo>;

export const Default: Story = {};
export const Active: Story = { args: { active: true } };
