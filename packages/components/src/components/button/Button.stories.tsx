import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

// One story per variant/state, generated components follow this same
// shape (see ai-tools-app's design-system codegen) -- this is also what
// the component detail page in ai-tools-app deep-links into (Storybook's
// ?path=/story/<id> convention), so this file doubles as the platform's
// live preview mechanism, not just local dev tooling.
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  args: { children: "Button" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
