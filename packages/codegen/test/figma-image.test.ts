import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchNodeImage } from "../src/figma-image";

const PNG = new Uint8Array([1, 2, 3]);
function okFetch() {
  return async () => ({ ok: true, arrayBuffer: async () => PNG.buffer }) as unknown as Response;
}

test("fetchNodeImage returns png bytes when the node renders", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: okFetch(),
  });
  assert.deepEqual(r, { bytes: PNG, mediaType: "image/png" });
});

test("fetchNodeImage returns null when Figma has no URL for the node", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": null }),
    fetchImpl: okFetch(),
  });
  assert.equal(r, null);
});

test("fetchNodeImage returns null when the download fails", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: async () => ({ ok: false }) as unknown as Response,
  });
  assert.equal(r, null);
});
