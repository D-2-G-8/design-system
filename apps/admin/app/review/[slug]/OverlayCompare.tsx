"use client";

import { useId, useState } from "react";
import styles from "../review.module.css";

/**
 * Onion-skin overlay for the review page: stacks the Figma design (bottom) and
 * the Storybook render (top) in one box so a reviewer can spot subtle visual
 * drift by eye instead of flicking between two side-by-side plates.
 *
 * Two controls:
 *  - opacity slider (0–100%) drives the top image → cross-fade / onion-skin.
 *  - "Difference" toggle flips the top image to mix-blend-mode: difference —
 *    matching pixels go black, discrepancies glow. Difference is meaningless at
 *    partial opacity, so the top image renders at full opacity while it's on.
 *
 * Client-only and purely additive: reuses the images the page already fetched,
 * no server action / no cost. Only rendered when BOTH images exist (see page.tsx).
 */
export function OverlayCompare({
  designSrc,
  renderedSrc,
  name,
}: {
  designSrc: string;
  renderedSrc: string;
  name: string;
}) {
  const [opacity, setOpacity] = useState(50);
  const [diff, setDiff] = useState(false);
  const sliderId = useId();

  // Difference mode is meaningless through partial opacity, so pin the top
  // image to fully opaque while it's active (the slider is disabled to match).
  const topOpacity = diff ? 1 : opacity / 100;

  return (
    <div className={styles.overlay}>
      <p className={styles.overlayLabel}>Overlay</p>

      <div className={styles.overlayStack}>
        <img
          src={designSrc}
          alt={`Figma design for ${name}`}
          className={styles.overlayImg}
        />
        <img
          src={renderedSrc}
          alt={`Rendered screenshot for ${name}`}
          className={`${styles.overlayImg} ${styles.overlayTop} ${diff ? styles.overlayDiff : ""}`}
          style={{ opacity: topOpacity }}
        />
      </div>

      <div className={styles.overlayControls}>
        <label className={styles.overlaySliderRow} htmlFor={sliderId}>
          <span className={styles.overlaySliderCap}>Figma</span>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            value={diff ? 100 : opacity}
            disabled={diff}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className={styles.overlaySlider}
            aria-label="Rendered opacity"
          />
          <span className={styles.overlaySliderCap}>Rendered</span>
        </label>

        <button
          type="button"
          className={`${styles.overlayToggle} ${diff ? styles.overlayToggleOn : ""}`}
          aria-pressed={diff}
          onClick={() => setDiff((d) => !d)}
        >
          Difference
        </button>
      </div>
    </div>
  );
}
