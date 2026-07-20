import type { Meta, StoryObj } from "@storybook/react";
import { DamleftnavigationExport } from "./DamleftnavigationExport";

const meta: Meta<typeof DamleftnavigationExport> = {
  title: "Components/DamleftnavigationExport",
  component: DamleftnavigationExport,
  args: { isOpen: false },
};
export default meta;

type Story = StoryObj<typeof DamleftnavigationExport>;

export const Default: Story = {};
export const Open: Story = { args: { isOpen: true } };
export const Close: Story = { args: { isOpen: false } };
