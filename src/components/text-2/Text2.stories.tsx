import type { Meta, StoryObj } from "@storybook/react";
import { Text2 } from "./Text2";

const meta: Meta<typeof Text2> = {
  title: "Components/Text2",
  component: Text2,
  args: { children: "Text content" },
};
export default meta;

type Story = StoryObj<typeof Text2>;

export const Default: Story = {};
