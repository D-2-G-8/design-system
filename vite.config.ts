import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";

// Library-mode build, not tsup: this package ships components styled with
// CSS Modules (workspace.designComponentStack === "react-css-modules" in
// ai-tools-app -- see that repo's src/lib/design-system-codegen/), and
// esbuild-based bundlers (tsup included) don't scope/hash *.module.css
// class names the way a real CSS-Modules-aware build does. Vite's library
// mode handles this natively (no extra plugin wiring) and is already the
// toolchain Storybook uses here, so this avoids adding a second bundler.
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      exclude: ["src/**/*.stories.tsx"],
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "DesignSystem",
      fileName: (format) => `design-system.${format === "es" ? "js" : "cjs"}`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
    cssCodeSplit: false,
  },
  css: {
    modules: {
      localsConvention: "camelCase",
    },
  },
});
