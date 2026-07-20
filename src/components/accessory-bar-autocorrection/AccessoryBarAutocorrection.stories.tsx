import type { Meta, StoryObj } from "@storybook/react";
import { AccessoryBarAutocorrection } from "./AccessoryBarAutocorrection";

const meta: Meta<typeof AccessoryBarAutocorrection> = {
  title: "Components/AccessoryBarAutocorrection",
  component: AccessoryBarAutocorrection,
  args: { selection: 1 },
};
export default meta;

type Story = StoryObj<typeof AccessoryBarAutocorrection>;

export const Default: Story = {};
