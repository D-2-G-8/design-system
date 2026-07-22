# State-as-files conventions

This design system uses **git as the source of truth** for design-system
state. There is no platform database, no status column, and no reconcile
job. Every piece of state that used to live in a row in the old platform's
`design_component` table (plus its `contractJson` blob) now lives as a
committed file in this repo. What's on `main` (or in an open PR) *is* the
state — you read it by reading the filesystem, not by querying a service.

This document describes the three file conventions that make that possible:
per-component contract files, the root manifest, and the root token source.

## 1. Component contract files

Every component (and every icon) directory carries a co-located
`<slug>.contract.json` file, for example:

```
packages/components/src/components/button/button.contract.json
```

This file holds exactly the data that used to be split across the
platform's `design_component` row and its `contractJson` column:

```json
{
  "name": "Button",
  "slug": "button",
  "isIcon": false,
  "figmaNodeIds": [],
  "variants": [],
  "states": [],
  "contract": {
    "props": [
      { "name": "variant", "type": "'primary' | 'secondary'", "description": "Visual style of the button" }
    ],
    "cssVariables": [],
    "classNames": []
  }
}
```

Field reference:

- `name` — human-readable component name (e.g. `"Button"`).
- `slug` — kebab-case identifier, matches the directory name.
- `isIcon` — `true` for icon components, `false` for regular components.
- `figmaNodeIds` — Figma node IDs this component is synced from. Empty
  until the first Figma sync backfills them.
- `variants` — the component's variant axes (e.g. sizes, styles), as
  produced by the Figma sync.
- `states` — the component's interactive states (e.g. hover, disabled).
- `contract` — the code-facing API surface:
  - `contract.props` — `{ name, type, description }` for each prop the
    component accepts.
  - `contract.cssVariables` — the design tokens (CSS custom properties)
    the component consumes.
  - `contract.classNames` — the CSS class names the component exposes.

Newly-seeded components ship with an **empty** contract
(`variants: []`, `states: []`, `contract.props: []`, etc.) and empty
`figmaNodeIds`. The admin tooling (later phases) regenerates and
overwrites this file whenever it syncs from Figma — hand edits to a
synced contract will be replaced by the next sync, the same way
`tokens.css` hand edits are replaced today.

## 2. `design-system.manifest.json` (repo root)

The manifest is the **curated inventory** of what belongs in the design
system — the list of components and icons that are considered part of
the published library, independent of what contract files happen to
exist on disk. It lives at the repo root:

```json
{
  "components": [
    { "name": "Button", "slug": "button", "isIcon": false, "figmaNodeIds": [] }
  ],
  "icons": []
}
```

Each entry is a lightweight pointer (`name`, `slug`, `isIcon`,
`figmaNodeIds`) — the full contract detail lives in the component's own
`<slug>.contract.json`, not duplicated here. Adding or removing a
component from the design system means adding or removing its entry
from this file (and adding/removing the corresponding component
directory + contract file).

## 3. `tokens/tokens.json` (repo root)

The token *source*. This is the pre-CSS representation of design
tokens — a plain map from token name to its metadata:

```json
{
  "text-primary": { "category": "color", "value": "#0a0a0a" },
  "spacing-sm": { "category": "spacing", "value": "8px" }
}
```

`packages/components/src/tokens/tokens.css` remains the *build output*
consumed by components (`var(--text-primary)`, etc.) — `tokens/tokens.json`
is the structured source those CSS custom properties are generated from.
Token names in `tokens.json` map 1:1 to CSS variable names by stripping
the `--` prefix (`text-primary` → `--text-primary`).

## State is derived, not stored

There is no `status` field anywhere in these files, and no reconcile
step that syncs a database against the repo. Instead, state is read
directly off git:

- A component directory + contract file **committed to `main`** →
  the component is **"committed"** — live, shipped, part of the
  library.
- A component directory + contract file that exists only on a
  **branch with an open pull request** → the component is
  **"pending"** — proposed, under review, not yet part of the
  library.
- No directory, no file, no PR → the component doesn't exist.

Answering "what's the current state of component X" is answering "what
does git show for X" — `git log`, `git show`, `gh pr list`, or simply
reading the file at a given ref. There is no separate system of record
to fall out of sync with the repo, because the repo *is* the system of
record.

## Seeding vs. syncing

The files described here currently contain **seed data** — a minimal,
hand-written starting point (one component, eight tokens, empty
contracts) that establishes the file shapes and directory conventions.
They are not meant to be exhaustive or hand-maintained long-term. Once
the admin tooling's Figma sync (later phases) runs for the first time,
it regenerates `design-system.manifest.json`, `tokens/tokens.json`,
and every `<slug>.contract.json` from Figma, overwriting these seeds —
the same way `tokens.css`'s header comment already warns that hand
edits get overwritten by the next token sync.
