import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  componentIdentifier,
  componentSourcePaths,
  storybookDefaultStoryId,
  storybookStandUrl,
} from "../src/paths";

test("slugify inserts hyphens at camelCase boundaries", () => {
  assert.equal(slugify("InputText"), "input-text");
  assert.equal(slugify("Button"), "button");
});

test("componentIdentifier prefixes digit-leading slugs so it is a valid identifier", () => {
  assert.equal(componentIdentifier("button"), "Button");
  assert.equal(componentIdentifier("24-outline-orders"), "N24OutlineOrders");
});

test("componentSourcePaths targets icons vs components and uses .module.scss", () => {
  const c = componentSourcePaths("button", false);
  assert.equal(c.dir, "src/components/button");
  assert.equal(c.cssPath, "src/components/button/Button.module.scss");
  const i = componentSourcePaths("plus", true);
  assert.equal(i.dir, "src/icons/plus");
  assert.equal(i.tsxPath, "src/icons/plus/Plus.tsx");
});

test("storybookDefaultStoryId is section-prefixed lowercase identifier", () => {
  assert.equal(storybookDefaultStoryId("button", false), "components-button--default");
  assert.equal(storybookDefaultStoryId("plus", true), "icons-plus--default");
});

test("storybookStandUrl handles {branch} template, fixed stand, and null", () => {
  assert.equal(storybookStandUrl("figma-sync-1", "https://ds-git-{branch}-team.vercel.app"), "https://ds-git-figma-sync-1-team.vercel.app");
  assert.equal(storybookStandUrl(null, "https://ds.example.com/"), "https://ds.example.com");
  assert.equal(storybookStandUrl(null, "https://ds-git-{branch}-team.vercel.app"), null);
  assert.equal(storybookStandUrl("x", undefined), null);
});
