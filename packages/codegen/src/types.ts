// Local port of the shapes that used to live in ai-tools-app's @/db/schema.
// State is files now (see docs/design-system-admin/conventions.md), so these
// are plain TS types -- no drizzle tables, no DB coupling.

export const designTokenCategoryValues = [
  "color",
  "typography",
  "spacing",
  "radius",
  "shadow",
  "duration",
  "other",
] as const;
export type DesignTokenCategory = (typeof designTokenCategoryValues)[number];

export interface DesignComponentVariant {
  name: string;
  description?: string;
}

export interface DesignComponentState {
  name: string;
  description?: string;
}

/**
 * The generated component's API contract (props + tokens + class names),
 * persisted next to the component as <slug>.contract.json so a DEPENDENT
 * component's codegen/review can validate the values it passes to this one
 * (and so the self gate can validate this component's own stories). Only
 * `props[].{name,type}` is read by the gates.
 */
export interface StoredComponentContract {
  props: { name: string; type: string; description?: string }[];
  cssVariables?: string[];
  classNames?: string[];
}
