import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node22",
  dts: true,
  clean: true,
  // The CLI is executed directly (bin) -- give it a node shebang.
  banner: ({ format }) => (format === "esm" ? { js: "#!/usr/bin/env node" } : {}),
});
