/**
 * Pure Figma-Style token resolvers -- ported from ai-tools-app's
 * src/lib/figma/sync.ts (rgbaToCss, resolveFillValue, resolveTextValue,
 * resolveEffectValue, STYLE_TYPE_TO_CATEGORY, resolveStyleValue). Given one
 * Figma style (FILL/TEXT/EFFECT/GRID, from GET /files/:key/styles or a
 * document-tree walk) and its already-resolved node (fills/style/effects),
 * produces a TokenForCss ({name, category, value}) or null.
 *
 * Deliberately has NO network/fs/DB coupling (no `server-only`, `@/db`,
 * drizzle): fetching the style's node is I/O and stays out of this module --
 * the caller (Task 4's runSync) fetches nodes and passes them in, mirroring
 * the source's split between fetchNodesBatched (I/O) and resolveStyleValue
 * (pure).
 */

import type { TokenForCss } from "./tokens";
import type { DesignTokenCategory } from "./types";

// ---- Figma node/style shapes (partial -- only the fields these resolvers read) ----

export interface FigmaRGBA {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1
}

export interface FigmaPaint {
  type: string; // "SOLID" | "GRADIENT_LINEAR" | "IMAGE" | ...
  visible?: boolean;
  opacity?: number;
  color?: FigmaRGBA;
}

export interface FigmaTypeStyle {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: number;
  lineHeightPx?: number;
  letterSpacing?: number;
}

export interface FigmaEffect {
  type: string; // "DROP_SHADOW" | "INNER_SHADOW" | "LAYER_BLUR" | ...
  visible?: boolean;
  radius?: number;
  color?: FigmaRGBA;
  offset?: { x: number; y: number };
}

/** The subset of a Figma node's properties a style's node can carry --
 *  only fills (FILL styles), style (TEXT styles), effects (EFFECT styles). */
export interface FigmaStyleNode {
  fills?: FigmaPaint[];
  style?: FigmaTypeStyle;
  effects?: FigmaEffect[];
}

/** One Figma style (from GET /files/:key/styles, or a document-tree
 *  `styles` map entry) -- only the fields resolveStyleToken reads. */
export interface FigmaStyleRef {
  name: string;
  styleType: string; // "FILL" | "TEXT" | "EFFECT" | "GRID"
}

// ---- Style value resolution ----

export function rgbaToCss(c: FigmaRGBA, opacity = 1): string {
  const alpha = c.a * opacity;
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  if (alpha >= 0.999) {
    const hex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`;
}

export function resolveFillValue(node: FigmaStyleNode): string | undefined {
  const fill = (node.fills ?? []).find((f) => f.type === "SOLID" && f.visible !== false && f.color);
  if (!fill?.color) return undefined;
  return rgbaToCss(fill.color, fill.opacity ?? 1);
}

export function resolveTextValue(node: FigmaStyleNode): string | undefined {
  const s = node.style;
  if (!s?.fontFamily || !s.fontSize) return undefined;
  const weight = s.fontWeight ?? 400;
  const lineHeight = s.lineHeightPx ? `/${Math.round(s.lineHeightPx)}px` : "";
  return `${weight} ${Math.round(s.fontSize)}px${lineHeight} ${s.fontFamily}`;
}

export function resolveEffectValue(node: FigmaStyleNode): string | undefined {
  const effect = (node.effects ?? []).find(
    (e) => (e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW") && e.visible !== false && e.color,
  );
  if (!effect?.color) return undefined;
  const inset = effect.type === "INNER_SHADOW" ? "inset " : "";
  const x = Math.round(effect.offset?.x ?? 0);
  const y = Math.round(effect.offset?.y ?? 0);
  const blur = Math.round(effect.radius ?? 0);
  return `${inset}${x}px ${y}px ${blur}px ${rgbaToCss(effect.color)}`;
}

export const STYLE_TYPE_TO_CATEGORY: Record<string, DesignTokenCategory | undefined> = {
  FILL: "color",
  TEXT: "typography",
  EFFECT: "shadow",
  // GRID intentionally unmapped -- layout guides have no clean CSS-token
  // equivalent, skipped rather than guessed at.
};

function resolveStyleValue(category: DesignTokenCategory, node: FigmaStyleNode): string | undefined {
  if (category === "color") return resolveFillValue(node);
  if (category === "typography") return resolveTextValue(node);
  if (category === "shadow") return resolveEffectValue(node);
  return undefined;
}

/**
 * Maps one Figma style + its already-resolved node to a TokenForCss, or
 * null when the style's type is unmapped (GRID) or its value can't be
 * resolved (e.g. no visible SOLID fill, missing text style, no shadow
 * effect) -- the caller counts these as skipped rather than guessing.
 */
export function resolveStyleToken(style: FigmaStyleRef, node: FigmaStyleNode): TokenForCss | null {
  const category = STYLE_TYPE_TO_CATEGORY[style.styleType];
  if (!category) return null;
  const value = resolveStyleValue(category, node);
  if (!value) return null;
  return { name: style.name, category, value };
}
