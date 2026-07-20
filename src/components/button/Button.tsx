import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant. Maps to a Figma "Variant" property once this component is Figma-generated. */
  variant?: "primary" | "secondary";
  children: ReactNode;
}

/**
 * Example component -- proves the repo's build/publish/Storybook pipeline
 * end to end before any Figma-generated component exists. Real components
 * land alongside this one via ai-tools-app's design-system codegen (see
 * that repo's src/lib/design-system-codegen/), following the same shape:
 * Component.tsx + Component.module.css + Component.stories.tsx.
 */
export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const variantClass = variant === "secondary" ? styles.secondary : styles.primary;
  return <button className={[styles.button, variantClass, className].filter(Boolean).join(" ")} {...rest} />;
}
