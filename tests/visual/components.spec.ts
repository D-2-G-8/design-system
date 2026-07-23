import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { storybookAllVariantsStoryId, storybookDefaultStoryId } from "../../packages/codegen/src/paths";

// Data-driven from the manifest: one screenshot test per COMMITTED component's
// Default story (a manifest entry whose component dir doesn't exist yet is
// skipped). No per-component spec files, no hardcoded names.
interface Entry { slug: string; isIcon: boolean }
const root = process.cwd(); // playwright is invoked from the repo root
const manifest = JSON.parse(readFileSync(join(root, "design-system.manifest.json"), "utf8")) as {
  components: Entry[]; icons: Entry[];
};
const committed = [...manifest.components, ...manifest.icons].filter((c) =>
  existsSync(join(root, `packages/components/src/${c.isIcon ? "icons" : "components"}/${c.slug}`)),
);

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort()); // determinism: no external net
});

/** True if the built Storybook (served by the webServer) has this story id.
 *  Lets the baseline use the AllVariants board when present and fall back to
 *  Default for components generated before the showcase story existed. */
async function storyExists(page: import("@playwright/test").Page, id: string): Promise<boolean> {
  try {
    const res = await page.request.get("/index.json");
    if (!res.ok()) return false;
    const data = (await res.json()) as { entries?: Record<string, unknown> };
    return Boolean(data.entries && id in data.entries);
  } catch {
    return false;
  }
}

for (const c of committed) {
  test(`visual: ${c.slug}`, async ({ page }, testInfo) => {
    const baseline = join(root, `tests/visual/__screenshots__/linux/${c.slug}.png`);
    // Skip only when we're NOT writing snapshots (config 'none' -> CI's read-only
    // run) AND no baseline exists yet, so CI stays green for not-yet-generated
    // components. The worker passes --update-snapshots (=> 'changed'/'all', anything
    // but 'none'), so it never skips and DOES create/refresh the baseline. Mirrors
    // Playwright's own write-missing gate (updateSnapshots !== 'none').
    if (testInfo.config.updateSnapshots === "none" && !existsSync(baseline)) {
      test.skip(true, "no committed baseline yet");
    }
    const allId = storybookAllVariantsStoryId(c.slug, c.isIcon);
    const storyId = (await storyExists(page, allId)) ? allId : storybookDefaultStoryId(c.slug, c.isIcon);
    await page.goto(`iframe.html?id=${storyId}&viewMode=story`);
    await expect(page.locator("#storybook-root")).toHaveScreenshot(`${c.slug}.png`);
  });
}
