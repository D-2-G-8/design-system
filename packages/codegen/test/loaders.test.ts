import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadManifest,
  loadTokens,
  loadComponentContract,
  loadCommittedContracts,
  loadAllComponentRows,
  writeComponent,
  writeSeedContract,
  type ComponentContractFile,
} from "../src/loaders";

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "codegen-loaders-"));
  writeFileSync(
    join(root, "design-system.manifest.json"),
    JSON.stringify({
      figmaFileKey: "FILEKEY",
      components: [{ name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:2"] }],
      icons: [{ name: "Plus", slug: "plus", isIcon: true, figmaNodeIds: ["3:4"] }],
    }),
  );
  mkdirSync(join(root, "tokens"), { recursive: true });
  writeFileSync(
    join(root, "tokens", "tokens.json"),
    JSON.stringify({ "text-primary": { category: "color", value: "#0a0a0a" } }),
  );
  const dir = join(root, "packages", "components", "src", "components", "button");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "button.contract.json"),
    JSON.stringify({
      name: "Button",
      slug: "button",
      isIcon: false,
      figmaNodeIds: ["1:2"],
      variants: [{ name: "primary" }],
      states: [],
      contract: { props: [{ name: "variant", type: "'primary' | 'secondary'" }], cssVariables: [], classNames: ["root"] },
    }),
  );
  return root;
}

test("loadManifest reads components, icons, and figmaFileKey", () => {
  const root = makeRepo();
  const m = loadManifest(root);
  assert.equal(m.figmaFileKey, "FILEKEY");
  assert.equal(m.components[0].slug, "button");
  assert.equal(m.icons[0].slug, "plus");
});

test("loadTokens maps tokens.json to TokenForCss[]", () => {
  const root = makeRepo();
  const t = loadTokens(root);
  assert.deepEqual(t, [{ name: "text-primary", category: "color", value: "#0a0a0a" }]);
});

test("loadComponentContract / loadCommittedContracts / loadAllComponentRows read committed state", () => {
  const root = makeRepo();
  const c = loadComponentContract("button", root);
  assert.equal(c?.contract.props[0].name, "variant");
  const committed = loadCommittedContracts(root);
  assert.equal(committed.get("button")?.props[0].type, "'primary' | 'secondary'");
  const rows = loadAllComponentRows(root);
  assert.equal(rows.length, 2); // button + plus from the manifest
});

test("writeComponent writes 4 files + contract.json under packages/components", () => {
  const root = makeRepo();
  const contractFile: ComponentContractFile = {
    name: "Chip",
    slug: "chip",
    isIcon: false,
    figmaNodeIds: [],
    variants: [],
    states: [],
    contract: { props: [], cssVariables: [], classNames: [] },
  };
  const written = writeComponent(
    contractFile,
    {
      componentName: "Chip",
      tsxPath: "src/components/chip/Chip.tsx",
      tsxContent: "export const Chip = () => null;\n",
      cssPath: "src/components/chip/Chip.module.scss",
      cssContent: ".root {}\n",
      storiesPath: "src/components/chip/Chip.stories.tsx",
      storiesContent: "export default {};\n",
      indexPath: "src/components/chip/index.ts",
      indexContent: "export { Chip } from './Chip';\n",
      deletePaths: [],
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
    },
    root,
  );
  const base = join(root, "packages", "components", "src", "components", "chip");
  assert.ok(existsSync(join(base, "Chip.tsx")));
  assert.ok(existsSync(join(base, "chip.contract.json")));
  assert.equal(JSON.parse(readFileSync(join(base, "chip.contract.json"), "utf8")).name, "Chip");
  assert.ok(written.length >= 5);
});

test("writeSeedContract preserves an existing contract's figmaUpdatedAt across re-sync", () => {
  const root = makeRepo(); // existing helper; has a manifest so componentSourcePaths dir resolves
  // First: a generated contract stamped with a generated-from time.
  writeSeedContract(
    {
      name: "Button",
      slug: "button",
      isIcon: false,
      figmaNodeIds: ["1:1"],
      variants: [],
      states: [],
      contract: { props: [{ name: "x" } as any], cssVariables: [], classNames: [] },
      figmaUpdatedAt: "2026-07-01T00:00:00Z",
    },
    root,
  );
  // Re-sync writes a fresh seed WITHOUT figmaUpdatedAt (seed = no generated-from).
  writeSeedContract(
    {
      name: "Button",
      slug: "button",
      isIcon: false,
      figmaNodeIds: ["1:1"],
      variants: [],
      states: [],
      contract: { props: [], cssVariables: [], classNames: [] },
    },
    root,
  );
  const loaded = loadComponentContract("button", root);
  assert.equal(loaded?.figmaUpdatedAt, "2026-07-01T00:00:00Z", "generated-from stamp survives re-sync");
  assert.equal(loaded?.contract.props.length, 1, "generated contract block also preserved");
});
