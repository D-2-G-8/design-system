// Thin GitHub REST client used to dispatch and poll the generate.yml
// worker workflow. GITHUB_TOKEN / GITHUB_DESIGN_SYSTEM_REPO are read
// lazily (inside getConfig(), only when a function here is actually
// called) so that `next build` succeeds with no env configured at all.
import { matchRunByJobId } from "./run-correlation";

export interface WorkflowRun {
  id: number;
  status: string | null;
  conclusion: string | null;
  html_url: string;
}

function getConfig(): { token: string; repo: string } {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_DESIGN_SYSTEM_REPO;
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set");
  }
  if (!repo) {
    throw new Error("GITHUB_DESIGN_SYSTEM_REPO is not set");
  }
  return { token, repo };
}

async function githubFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { token } = getConfig();
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...init.headers,
    },
  });
}

/**
 * Dispatches the generate.yml workflow for a component `slug`, tagged with
 * `jobId` so the run can be correlated back to a job row. Dispatches
 * against the repo's default branch (resolved via the API rather than
 * hardcoded, so a default-branch rename doesn't silently break this).
 */
export async function dispatchGenerate(slug: string, jobId: string): Promise<void> {
  const { repo } = getConfig();

  const repoRes = await githubFetch(`/repos/${repo}`);
  if (!repoRes.ok) {
    throw new Error(
      `Failed to look up default branch for ${repo}: ${repoRes.status} ${await repoRes.text()}`,
    );
  }
  const repoInfo = (await repoRes.json()) as { default_branch: string };

  const dispatchRes = await githubFetch(
    `/repos/${repo}/actions/workflows/generate.yml/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({
        ref: repoInfo.default_branch,
        inputs: { slug, jobId },
      }),
    },
  );
  if (!dispatchRes.ok) {
    throw new Error(
      `Failed to dispatch generate.yml: ${dispatchRes.status} ${await dispatchRes.text()}`,
    );
  }
}

/** Fetches status/conclusion for a workflow run by id. */
export async function getWorkflowRun(runId: number | string): Promise<WorkflowRun> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/actions/runs/${runId}`);
  if (!res.ok) {
    throw new Error(`Failed to get workflow run ${runId}: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as WorkflowRun;
}

/** Lists recent generate.yml runs and returns the one whose run-name carries
 *  `jobId` (workflow_dispatch doesn't return a run id, so we correlate by name).
 *  Null if it hasn't appeared yet. */
export async function findRunByJobId(jobId: string): Promise<WorkflowRun | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/actions/workflows/generate.yml/runs?per_page=50`);
  if (!res.ok) {
    throw new Error(`Failed to list generate.yml runs: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { workflow_runs: (WorkflowRun & { name: string | null })[] };
  const match = matchRunByJobId(data.workflow_runs ?? [], jobId);
  return match ? { id: match.id, status: match.status, conclusion: match.conclusion, html_url: match.html_url } : null;
}

/** Read a file's decoded UTF-8 content from the repo at `ref` (default master).
 *  Null on 404. */
export async function getFileContent(path: string, ref = "master"): Promise<string | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}?ref=${ref}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getFileContent ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content?: string };
  return data.content ? Buffer.from(data.content, "base64").toString("utf8") : null;
}

/** List a directory's immediate entry names at `ref` (default master). Empty on
 *  404 (dir not created yet). */
export async function listDirEntries(path: string, ref = "master"): Promise<string[]> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}?ref=${ref}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`listDirEntries ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { name: string }[];
  return Array.isArray(data) ? data.map((e) => e.name) : [];
}

/** Open PRs whose head branch is `codegen/*` → Map<headBranch, html_url>. */
export async function listOpenCodegenPRs(): Promise<Map<string, string>> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&per_page=100`);
  if (!res.ok) throw new Error(`listOpenCodegenPRs: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { head: { ref: string }; html_url: string }[];
  const map = new Map<string, string>();
  for (const pr of prs) if (pr.head?.ref?.startsWith("codegen/")) map.set(pr.head.ref, pr.html_url);
  return map;
}

/** The open codegen/<slug> PR, or null. */
export async function getPullRequestForSlug(
  slug: string,
): Promise<{ number: number; body: string; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:codegen/${slug}`);
  if (!res.ok) throw new Error(`getPullRequestForSlug ${slug}: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; body: string | null; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, body: pr.body ?? "", htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}

/** Raw base64 file content at `ref` (NOT utf8-decoded -- for binary/PNG). Null on 404. */
export async function getFileBase64(path: string, ref: string): Promise<string | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${encodeURI(path)}?ref=${ref}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getFileBase64 ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content?: string };
  return data.content ? data.content.replace(/\n/g, "") : null;
}
