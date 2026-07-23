import { loadComponentState } from "@/lib/design-state";
import { list as listJobs } from "@/lib/jobs";
import { getSyncPullRequest } from "@/lib/github";
import { ComponentTable } from "./components/ComponentTable";
import { Header } from "./components/Header";
import { JobsPanel } from "./components/JobsPanel";
import { SyncButton } from "./components/SyncButton";
import styles from "./components/dashboard.module.css";

// Reads GitHub + the job DB at request time; must never run at build time
// (both are unconfigured during `next build`), so this route is excluded
// from static prerendering.
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const state = await loadComponentState().catch((e) => (e instanceof Error ? e.message : String(e)));
  const jobs = await listJobs().catch(() => []);
  const syncPr = await getSyncPullRequest().catch(() => null);

  if (typeof state === "string") {
    return (
      <main className={styles.main}>
        <Header />
        <div className={styles.wrap}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>Component generation</p>
            <h1>Design System Admin</h1>
          </header>
          <p className={styles.error}>
            Not configured: {state}. Set GITHUB_TOKEN + GITHUB_DESIGN_SYSTEM_REPO.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.wrap}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Component generation</p>
          <h1>Design System Admin</h1>
          <p className={styles.tagline}>
            Status is read straight from git: committed components have shipped, pending ones have an
            open codegen pull request, and the rest have never been generated.
          </p>
          <SyncButton />
          {syncPr && (
            <a className={styles.syncReviewBanner} href="/review/sync">
              New Figma sync ready to review →
            </a>
          )}
        </header>
        <ComponentTable state={state} storybookUrl={process.env.DESIGN_SYSTEM_STORYBOOK_URL ?? null} />
        <JobsPanel initialJobs={jobs} repo={process.env.GITHUB_DESIGN_SYSTEM_REPO ?? null} />
      </div>
    </main>
  );
}
