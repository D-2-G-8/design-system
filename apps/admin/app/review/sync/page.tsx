import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSyncPullRequest, getFileContent, getPullRequestMergeState, canMerge } from "@/lib/github";
import { diffCatalog, diffTokens, type Manifest, type TokenEntry } from "@/lib/sync-diff";
import { SyncActions } from "./SyncActions";
import styles from "../review.module.css";

export const dynamic = "force-dynamic";

async function readManifest(ref: string): Promise<Manifest> {
  const raw = await getFileContent("design-system.manifest.json", ref).catch(() => null);
  if (!raw) return {};
  try { return JSON.parse(raw) as Manifest; } catch { return {}; }
}
async function readTokens(ref: string): Promise<Record<string, TokenEntry>> {
  const raw = await getFileContent("tokens/tokens.json", ref).catch(() => null);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, TokenEntry>; } catch { return {}; }
}

export default async function SyncReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const pr = await getSyncPullRequest().catch(() => null);
  if (!pr) {
    return (
      <main className={styles.main}>
        <div className={styles.wrap}>
          <a className={styles.back} href="/">← Back to dashboard</a>
          <header className={styles.header}><p className={styles.eyebrow}>Sync review</p><h1>No open Figma sync</h1></header>
          <p className={styles.error}>There is no open sync PR. Click “Sync from Figma” on the dashboard first.</p>
        </div>
      </main>
    );
  }

  const [baseManifest, headManifest, baseTokens, headTokens, mergeState] = await Promise.all([
    readManifest("master"),
    readManifest(pr.headRef),
    readTokens("master"),
    readTokens(pr.headRef),
    getPullRequestMergeState(pr.number).catch(() => null),
  ]);

  const cat = diffCatalog(baseManifest, headManifest);
  const tok = diffTokens(baseTokens, headTokens);
  const gate = mergeState ? canMerge(mergeState) : { ok: false, reason: "could not read merge state" };

  const nameList = (xs: { name: string }[]) => xs.map((e) => e.name).join(", ") || "—";

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <a className={styles.back} href="/">← Back to dashboard</a>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Sync review</p>
          <h1>Figma library sync</h1>
          <div className={styles.metaRow}>
            <a className={styles.prLink} href={pr.htmlUrl} target="_blank" rel="noreferrer">Open PR ↗</a>
          </div>
        </header>

        <section aria-labelledby="catalog-heading" className={styles.findings}>
          <h2 id="catalog-heading" className={styles.sectionHeading}>Catalog changes vs master</h2>
          <ul className={styles.diffList}>
            <li><strong>Components added ({cat.components.added.length}):</strong> {nameList(cat.components.added)}</li>
            <li><strong>Components removed ({cat.components.removed.length}):</strong> {nameList(cat.components.removed)}</li>
            <li><strong>Components renamed ({cat.components.renamed.length}):</strong> {cat.components.renamed.map((r) => `${r.from}→${r.to}`).join(", ") || "—"}</li>
            <li><strong>Icons added ({cat.icons.added.length}):</strong> <details><summary>show</summary>{nameList(cat.icons.added)}</details></li>
            <li><strong>Icons removed ({cat.icons.removed.length}):</strong> <details><summary>show</summary>{nameList(cat.icons.removed)}</details></li>
            <li><strong>Tokens:</strong> +{tok.added.length} / −{tok.removed.length} / ~{tok.changed.length} changed</li>
          </ul>
          <p className={styles.hint}>Something wrong, or missing? Fix the 🟢 marker in Figma and press “Sync from Figma” again.</p>
        </section>

        <section aria-labelledby="accept-heading" className={styles.mergePanel}>
          <h2 id="accept-heading" className={styles.sectionHeading}>Accept</h2>
          <p className={styles.mergeStatusText}>{mergeState ? <>CI: {mergeState.ciSummary}</> : gate.reason}</p>
          <SyncActions acceptDisabled={!gate.ok} disabledReason={gate.reason} />
        </section>
      </div>
    </main>
  );
}
