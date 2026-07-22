import { test } from "node:test";
import assert from "node:assert/strict";
import {
  rgbaToCss,
  resolveFillValue,
  resolveTextValue,
  resolveEffectValue,
  resolveStyleToken,
  STYLE_TYPE_TO_CATEGORY,
} from "../src/sync-tokens";

test("STYLE_TYPE_TO_CATEGORY maps FILL/TEXT/EFFECT, skips GRID", () => {
  assert.equal(STYLE_TYPE_TO_CATEGORY.FILL, "color");
  assert.equal(STYLE_TYPE_TO_CATEGORY.TEXT, "typography");
  assert.equal(STYLE_TYPE_TO_CATEGORY.EFFECT, "shadow");
  assert.equal(STYLE_TYPE_TO_CATEGORY.GRID, undefined);
});

test("rgbaToCss: hex when opaque, rgba otherwise", () => {
  assert.equal(rgbaToCss({ r: 0, g: 0, b: 0, a: 1 }), "#000000");
  assert.match(rgbaToCss({ r: 1, g: 1, b: 1, a: 0.5 }), /^rgba\(/);
});

test("resolveFillValue: first visible SOLID → css color; none → undefined", () => {
  assert.equal(resolveFillValue({ fills: [{ type: "SOLID", visible: true, color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1 }] }), "#000000");
  assert.equal(resolveFillValue({ fills: [] }), undefined);
});

test("resolveFillValue: skips invisible fills, picks first visible SOLID", () => {
  const v = resolveFillValue({
    fills: [
      { type: "SOLID", visible: false, color: { r: 0, g: 0, b: 0, a: 1 } },
      { type: "IMAGE", visible: true },
      { type: "SOLID", visible: true, color: { r: 1, g: 1, b: 1, a: 1 } },
    ],
  });
  assert.equal(v, "#FFFFFF");
});

test("resolveTextValue: weight/size/lineHeight/family string", () => {
  const v = resolveTextValue({ style: { fontWeight: 400, fontSize: 16, lineHeightPx: 22, fontFamily: "Inter" } });
  assert.equal(v, "400 16px/22px Inter");
});

test("resolveTextValue: missing fontFamily/fontSize → undefined", () => {
  assert.equal(resolveTextValue({ style: { fontWeight: 400 } }), undefined);
  assert.equal(resolveTextValue({}), undefined);
});

test("resolveEffectValue: DROP_SHADOW → 'x y blur rgba', no inset", () => {
  const v = resolveEffectValue({
    effects: [{ type: "DROP_SHADOW", visible: true, radius: 4, offset: { x: 0, y: 2 }, color: { r: 0, g: 0, b: 0, a: 0.25 } }],
  });
  assert.equal(v, "0px 2px 4px rgba(0, 0, 0, 0.25)");
});

test("resolveEffectValue: INNER_SHADOW → 'inset ' prefix", () => {
  const v = resolveEffectValue({
    effects: [{ type: "INNER_SHADOW", visible: true, radius: 1, offset: { x: 0, y: 1 }, color: { r: 0, g: 0, b: 0, a: 1 } }],
  });
  assert.equal(v, "inset 0px 1px 1px #000000");
});

test("resolveEffectValue: no DROP/INNER shadow effect → undefined", () => {
  assert.equal(resolveEffectValue({ effects: [{ type: "LAYER_BLUR", visible: true, radius: 4 }] }), undefined);
  assert.equal(resolveEffectValue({ effects: [] }), undefined);
});

test("resolveStyleToken: FILL style + node with SOLID fill → TokenForCss", () => {
  const token = resolveStyleToken(
    { name: "Primary/500", styleType: "FILL" },
    { fills: [{ type: "SOLID", visible: true, color: { r: 0, g: 0, b: 0, a: 1 } }] },
  );
  assert.deepEqual(token, { name: "Primary/500", category: "color", value: "#000000" });
});

test("resolveStyleToken: GRID styleType is unmapped → null", () => {
  const token = resolveStyleToken({ name: "8px grid", styleType: "GRID" }, {});
  assert.equal(token, null);
});

test("resolveStyleToken: unresolvable value (no visible SOLID fill) → null", () => {
  const token = resolveStyleToken({ name: "Ghost", styleType: "FILL" }, { fills: [] });
  assert.equal(token, null);
});
