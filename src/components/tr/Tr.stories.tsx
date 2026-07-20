import type { Meta, StoryObj } from "@storybook/react";
import { Tr } from "./Tr";

const meta: Meta<typeof Tr> = {
  title: "Components/Tr",
  component: Tr,
  args: {
    variant: "default",
    hover: false,
    children: (
      <>
        <td>Cell 1</td>
        <td>Cell 2</td>
        <td>Cell 3</td>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <table>
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof Tr>;

export const Default: Story = {};

export const Variant2: Story = {
  args: {
    variant: "variant2",
  },
};

export const Variant3: Story = {
  args: {
    variant: "variant3",
  },
};

export const Variant4: Story = {
  args: {
    variant: "variant4",
  },
};

export const Hover: Story = {
  args: {
    hover: true,
  },
};
