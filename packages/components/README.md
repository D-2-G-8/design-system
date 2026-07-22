# @d-2-g-8/design-system

Shared React component library + design tokens, generated from Figma and
validated by the design-system admin (see the monorepo root for the full
generate → review → merge pipeline). This is the **published package**; you
install it, you don't hand-author components here.

## Install (GitHub Packages)

This publishes to **GitHub Packages**, not the public npm registry, so an
install needs a `read:packages`-scoped GitHub token.

1. Add to your project's `.npmrc`:
   ```
   @d-2-g-8:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_READ_TOKEN}
   ```
2. Export `GITHUB_PACKAGES_READ_TOKEN` (a GitHub PAT with `read:packages`) in
   your environment / CI.
3. Install:
   ```sh
   npm install @d-2-g-8/design-system   # or pnpm/yarn
   ```

## Use

Import the tokens + component styles once, globally, then the components:

```ts
import "@d-2-g-8/design-system/tokens.css"; // design tokens (CSS custom properties)
import "@d-2-g-8/design-system/style.css";  // component styles
import { Button } from "@d-2-g-8/design-system";
```

Components reference tokens via `var(--token-name)`, so a token resync updates
every component at once — never hardcode a value over a token.

## Versioning

The whole library is versioned together (one semver for the package). A merge
to `master` that changes `packages/components/**` triggers a patch bump +
publish via `.github/workflows/publish.yml` — admin/docs merges don't republish.
Pin a version (`@d-2-g-8/design-system@x.y.z`) if you need stability across
resyncs.
