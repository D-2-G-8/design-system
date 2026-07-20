import type { Meta, StoryObj } from "@storybook/react";
import { LogoLeftMenu } from "./LogoLeftMenu";

const meta: Meta<typeof LogoLeftMenu> = {
  title: "Components/LogoLeftMenu",
  component: LogoLeftMenu,
  args: { logo: "on" },
};
export default meta;

type Story = StoryObj<typeof LogoLeftMenu>;

export const Default: Story = {};
export const LogoOn: Story = { args: { logo: "on" } };
export const LogoOff: Story = { args: { logo: "off" } };
