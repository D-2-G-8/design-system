import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFileBase64, getFileContent, getPullRequestForSlug, getPullRequestMergeState, canMerge } from "@/lib/github";
import { fetchNodeImageDataUrl } from "@/lib/figma";
import { MergeButton } from "../MergeButton";
import { BaselineButton } from "./BaselineButton";
import { OverlayCompare } from "./OverlayCompare";
import styles from "../review.module.css";

// Reads GitHub (PR + manifest + screenshot) and Figma at request time -- all
// of it advisory/read-only, so this route is excluded from static
// prerendering and every fetch below is individually .catch-guarded: a
// missing PR, missing manifest entry, missing screenshot, or missing Figma
// config each degrade to a fallback rather than crashing the page.
export const dynamic = "force-dynamic";

interface ManifestEntry {
  slug: string;
  name: string;
  isIcon: boolean;
  figmaNodeIds?: string[];
}

interface Manifest {
  figmaFileKey?: string;
  components: ManifestEntry[];
  icons: ManifestEntry[];
}

function findManifestEntry(manifest: Manifest | null, slug: string): ManifestEntry | null {
  if (!manifest) return null;
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.find((e) => e.slug === slug) ?? null;
}

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  // Middleware already redirects unauthenticated requests, but this page now
  // hosts a mutating control (merge), so it re-checks in-code too rather than
  // relying solely on the middleware matcher.
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const { slug } = await params;

  const pr = await getPullRequestForSlug(slug).catch(() => null);

  if (!pr) {
    return (
      <main className={styles.main}>
        <div className={styles.wrap}>
          <a className={styles.back} href="/">
            ← Back to dashboard
          </a>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Review</p>
            <h1>Review: {slug}</h1>
          </header>
          <p className={styles.error}>
            No open PR for {slug}. <a href="/">Back to dashboard</a>
          </p>
        </div>
      </main>
    );
  }

  const manifestRaw = await getFileContent("design-system.manifest.json").catch(() => null);
  // Guard the parse too: getFileContent returns raw file text without validating
  // it's JSON, so a malformed manifest on master (partial commit, conflict
  // markers, wrong file) would otherwise throw and 500 the whole review page.
  // Degrade to null like a missing manifest -> name=slug, fileKey=undefined.
  let manifest: Manifest | null = null;
  if (manifestRaw) {
    try {
      manifest = JSON.parse(manifestRaw) as Manifest;
    } catch {
      manifest = null;
    }
  }
  const entry = findManifestEntry(manifest, slug);
  const name = entry?.name ?? slug;
  const fileKey = process.env.FIGMA_FILE_KEY ?? manifest?.figmaFileKey;

  const renderedB64 = await getFileBase64(
    `tests/visual/__screenshots__/linux/${slug}.png`,
    pr.headRef,
  ).catch(() => null);
  const renderedSrc = renderedB64 ? `data:image/png;base64,${renderedB64}` : null;

  const token = process.env.FIGMA_ACCESS_TOKEN;
  const nodeId = entry?.figmaNodeIds?.[0];
  const designSrc =
    token && fileKey && nodeId ? await fetchNodeImageDataUrl(fileKey, nodeId, token).catch(() => null) : null;

  // Merge readiness is advisory here too -- `mergeComponentPr` re-checks the
  // same gate server-side immediately before merging, so a missing token or a
  // GitHub hiccup degrades this panel to "blocked" rather than crashing the
  // page or letting a stale read authorize a merge.
  const mergeState = await getPullRequestMergeState(pr.number).catch(() => null);
  const gate = mergeState ? canMerge(mergeState) : { ok: false, reason: "could not read merge state" };
  const mergeableLabel =
    mergeState?.mergeable === null ? "checking…" : mergeState?.mergeable ? "yes" : "no";

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <a className={styles.back} href="/">
          ← Back to dashboard
        </a>

        <header className={styles.header}>
          <p className={styles.eyebrow}>Review</p>
          <h1>Review: {name}</h1>
          <div className={styles.metaRow}>
            <span className={styles.slug}>{slug}</span>
            <a className={styles.prLink} href={pr.htmlUrl} target="_blank" rel="noreferrer">
              Open PR ↗
            </a>
          </div>
        </header>

        <section aria-labelledby="compare-heading">
          <h2 id="compare-heading" className={styles.sectionHeading}>
            Design vs rendered
          </h2>
          <div className={styles.compare}>
            <div className={styles.plate}>
              <p className={styles.plateLabel}>Figma design</p>
              <div className={styles.mount}>
                {designSrc ? (
                  <img src={designSrc} alt={`Figma design for ${name}`} className={styles.mountImg} />
                ) : (
                  <p className={styles.unavailable}>Design unavailable</p>
                )}
              </div>
            </div>
            <div className={styles.divider} aria-hidden="true" />
            <div className={styles.plate}>
              <p className={styles.plateLabel}>Rendered screenshot</p>
              <div className={styles.mount}>
                {renderedSrc ? (
                  <img
                    src={renderedSrc}
                    alt={`Rendered screenshot for ${name}`}
                    className={styles.mountImg}
                  />
                ) : (
                  <div className={styles.baselineEmpty}>
                    <p className={styles.unavailable}>No baseline screenshot yet</p>
                    <BaselineButton slug={slug} />
                  </div>
                )}
              </div>
            </div>
          </div>
          {designSrc && renderedSrc ? (
            <OverlayCompare designSrc={designSrc} renderedSrc={renderedSrc} name={name} />
          ) : null}
        </section>

        <section aria-labelledby="findings-heading" className={styles.findings}>
          <h2 id="findings-heading" className={styles.sectionHeading}>
            Findings
          </h2>
          {pr.body ? (
            <pre className={styles.findingsBody}>{pr.body}</pre>
          ) : (
            <pre className={`${styles.findingsBody} ${styles.findingsEmpty}`}>No findings recorded on this PR.</pre>
          )}
        </section>

        <section aria-labelledby="merge-heading" className={styles.mergePanel}>
          <h2 id="merge-heading" className={styles.sectionHeading}>
            Merge
          </h2>
          <div className={styles.mergeCard}>
            <div className={styles.mergeStatus}>
              <span
                className={`${styles.mergeDot} ${gate.ok ? styles.mergeDotReady : styles.mergeDotPending}`}
                aria-hidden="true"
              />
              <p className={styles.mergeStatusText}>
                {mergeState ? (
                  <>
                    Mergeable: <strong>{mergeableLabel}</strong> · CI: {mergeState.ciSummary}
                  </>
                ) : (
                  gate.reason
                )}
              </p>
            </div>
            <MergeButton slug={slug} prNumber={pr.number} disabled={!gate.ok} reason={gate.reason} />
          </div>
        </section>
      </div>
    </main>
  );
}
