import type { Preview } from "@storybook/react";
import "../src/tokens/tokens.css";

// Tokens are loaded globally so every story has real CSS custom properties
// to render against -- components never hardcode values, only var(--token-name).
const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};

export default preview;
