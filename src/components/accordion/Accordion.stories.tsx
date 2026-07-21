import type { Meta, StoryObj } from "@storybook/react";
import { Accordion as Component } from "./Accordion";

const meta: Meta<typeof Component> = {
  title: "Components/Accordion",
  component: Component,
  args: {
    title: "Title",
    description: "Description",
    chevronPosition: "right",
    icon: (
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
        <div style={{ fontFamily: 'Roboto Flex', fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>
          Lorem ipsum dolor sit amet, consectetur
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 3l6 6-6 6V3z" />
          </svg>
          <span style={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '18px', lineHeight: '24px' }}>
            Swap me
          </span>
        </div>
      </div>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof Component>;

export const Default: Story = {};

export const ChevronLeft: Story = {
  args: {
    chevronPosition: "left",
  },
};

export const Closed: Story = {
  args: {
    defaultOpen: false,
  },
};

export const ClosedChevronLeft: Story = {
  args: {
    defaultOpen: false,
    chevronPosition: "left",
  },
};

export const WithoutIcon: Story = {
  args: {
    icon: undefined,
  },
};

export const WithoutDescription: Story = {
  args: {
    description: "",
  },
};
