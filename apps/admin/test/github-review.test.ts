import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchNodeImageDataUrl } from "../lib/figma";

const PNG = new Uint8Array([137, 80, 78, 71]);

test("fetchNodeImageDataUrl → data URL on success", async () => {
  const r = await fetchNodeImageDataUrl("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: (async () => ({ ok: true, arrayBuffer: async () => PNG.buffer })) as unknown as typeof fetch,
  });
  assert.ok(r?.startsWith("data:image/png;base64,"));
});

test("null when Figma has no URL / download fails", async () => {
  assert.equal(await fetchNodeImageDataUrl("F", "1:2", "t", { getImages: async () => ({ "1:2": null }) }), null);
  assert.equal(await fetchNodeImageDataUrl("F", "1:2", "t", {
    getImages: async () => ({ "1:2": "u" }),
    fetchImpl: (async () => ({ ok: false })) as unknown as typeof fetch,
  }), null);
});
