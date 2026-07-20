import type { Meta, StoryObj } from "@storybook/react";
import { Regular } from "./Regular";

const meta: Meta<typeof Regular> = {
  title: "Components/Regular",
  component: Regular,
  args: {},
};
export default meta;

type Story = StoryObj<typeof Regular>;

export const Default: Story = {};
