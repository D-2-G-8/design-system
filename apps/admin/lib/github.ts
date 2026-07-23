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
  await dispatchWorkflow("generate.yml", { slug, jobId });
}

/** Dispatches the whole-library sync.yml workflow, tagged with `jobId` for
 *  run-name correlation. No slug -- the sync is whole-library. */
export async function dispatchSync(jobId: string): Promise<void> {
  await dispatchWorkflow("sync.yml", { jobId });
}

/** Dispatches the delete.yml worker for a component `slug`, tagged with `jobId`. */
export async function dispatchDelete(slug: string, jobId: string): Promise<void> {
  await dispatchWorkflow("delete.yml", { slug, jobId });
}

/** Dispatch a workflow against the repo's default branch (resolved via the API
 *  rather than hardcoded, so a default-branch rename doesn't silently break
 *  this). Shared by dispatchGenerate/dispatchSync. */
async function dispatchWorkflow(workflowFile: string, inputs: Record<string, string>): Promise<void> {
  const { repo } = getConfig();

  const repoRes = await githubFetch(`/repos/${repo}`);
  if (!repoRes.ok) {
    throw new Error(
      `Failed to look up default branch for ${repo}: ${repoRes.status} ${await repoRes.text()}`,
    );
  }
  const repoInfo = (await repoRes.json()) as { default_branch: string };

  const dispatchRes = await githubFetch(
    `/repos/${repo}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      body: JSON.stringify({ ref: repoInfo.default_branch, inputs }),
    },
  );
  if (!dispatchRes.ok) {
    throw new Error(
      `Failed to dispatch ${workflowFile}: ${dispatchRes.status} ${await dispatchRes.text()}`,
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

/** Lists recent runs of `workflowFile` and returns the one whose run-name
 *  carries `jobId` (workflow_dispatch doesn't return a run id, so we correlate
 *  by name). Defaults to generate.yml; sync jobs pass sync.yml. Null if the run
 *  hasn't appeared yet. */
export async function findRunByJobId(jobId: string, workflowFile = "generate.yml"): Promise<WorkflowRun | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/actions/workflows/${workflowFile}/runs?per_page=50`);
  if (!res.ok) {
    throw new Error(`Failed to list ${workflowFile} runs: ${res.status} ${await res.text()}`);
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

export interface TreeResult { paths: string[]; truncated: boolean }

/** Recursive git tree at `ref` (default master) -> all blob paths + the API's
 *  `truncated` flag. The caller MUST handle truncation rather than trust a
 *  partial list (a missing path would read as "not committed"). */
export async function listTree(ref = "master"): Promise<TreeResult> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/git/trees/${ref}?recursive=1`);
  if (!res.ok) throw new Error(`listTree ${ref}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { tree?: { path: string; type: string }[]; truncated?: boolean };
  const paths = (data.tree ?? []).filter((e) => e.type === "blob").map((e) => e.path);
  return { paths, truncated: Boolean(data.truncated) };
}

export interface CheckRun { status: string; conclusion: string | null; name?: string }

/** Reduce GitHub check-runs to a green flag + a short human summary. Green only
 *  when every run is completed with a non-failing conclusion and none is still
 *  running/queued. `totalCount` (from the API's `total_count`) fails the gate
 *  closed if the fetched page was TRUNCATED -- a failing run on an unfetched
 *  page must not read as green. */
export function summarizeChecks(runs: CheckRun[], totalCount?: number): { green: boolean; summary: string } {
  if (runs.length === 0) return { green: false, summary: "no checks reported" };
  if (typeof totalCount === "number" && totalCount > runs.length) {
    return { green: false, summary: `${totalCount} checks, only ${runs.length} read -- cannot confirm green` };
  }
  const running = runs.filter((r) => r.status !== "completed");
  if (running.length) return { green: false, summary: `${running.length} running: ${running.map((r) => r.name ?? "?").join(", ")}` };
  const failing = runs.filter((r) => !["success", "neutral", "skipped"].includes(r.conclusion ?? ""));
  if (failing.length) return { green: false, summary: `${failing.length} failing: ${failing.map((r) => r.name ?? "?").join(", ")}` };
  return { green: true, summary: `${runs.length} passing` };
}

/** Pure merge decision: ok only when GitHub says mergeable, no conflicts, CI green. */
export function canMerge(state: { mergeable: boolean | null; conflicts: boolean; ciGreen: boolean }): { ok: boolean; reason: string } {
  if (state.conflicts) return { ok: false, reason: "PR has conflicts" };
  if (state.mergeable === null) return { ok: false, reason: "GitHub is still computing mergeability -- refresh in a moment" };
  if (!state.mergeable) return { ok: false, reason: "PR is not mergeable" };
  if (!state.ciGreen) return { ok: false, reason: "CI is not green" };
  return { ok: true, reason: "" };
}

export interface PrMergeState { mergeable: boolean | null; conflicts: boolean; headSha: string; ciGreen: boolean; ciSummary: string }

/** Fetch the PR's mergeability + CI status for the gate. */
export async function getPullRequestMergeState(number: number): Promise<PrMergeState> {
  const { repo } = getConfig();
  const prRes = await githubFetch(`/repos/${repo}/pulls/${number}`);
  if (!prRes.ok) throw new Error(`getPullRequestMergeState ${number}: ${prRes.status} ${await prRes.text()}`);
  const pr = (await prRes.json()) as { mergeable: boolean | null; mergeable_state: string; head: { sha: string } };
  const headSha = pr.head.sha;
  // filter=latest supersedes re-run attempts; per_page=100 + the total_count
  // truncation guard in summarizeChecks keep a failing run on a 2nd page from
  // reading as green (the gate must fail closed on incomplete data).
  const checksRes = await githubFetch(`/repos/${repo}/commits/${headSha}/check-runs?per_page=100&filter=latest`);
  let ciGreen = false, ciSummary = "no checks reported";
  if (checksRes.ok) {
    const data = (await checksRes.json()) as { check_runs?: CheckRun[]; total_count?: number };
    ({ green: ciGreen, summary: ciSummary } = summarizeChecks(data.check_runs ?? [], data.total_count));
  }
  // `clean` is GitHub's "mergeable, no blockers" state. Gating on it (not just
  // `mergeable === true`) makes the button honest for branch-protection blocks
  // (blocked/behind/draft) instead of enabling a merge GitHub will 405.
  return { mergeable: pr.mergeable && pr.mergeable_state === "clean", conflicts: pr.mergeable_state === "dirty", headSha, ciGreen, ciSummary };
}

/** Squash-merge the PR, guarded by the head SHA (GitHub rejects if it moved).
 *  Returns { merged:false, message } on a 405/409 rather than throwing at the UI. */
export async function mergePullRequest(number: number, headSha: string): Promise<{ merged: boolean; message?: string }> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls/${number}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash", sha: headSha }),
  });
  if (res.ok) return { merged: true };
  const text = await res.text();
  if (res.status === 405 || res.status === 409) return { merged: false, message: `GitHub refused the merge (${res.status}): ${text.slice(0, 200)}` };
  throw new Error(`mergePullRequest ${number}: ${res.status} ${text}`);
}

/** The open sync/figma -> master PR, or null. */
export async function getSyncPullRequest(): Promise<{ number: number; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:sync/figma`);
  if (!res.ok) throw new Error(`getSyncPullRequest: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}

/** The open delete/<slug> -> master PR, or null. */
export async function getDeletePullRequest(
  slug: string,
): Promise<{ number: number; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:delete/${slug}`);
  if (!res.ok) throw new Error(`getDeletePullRequest ${slug}: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}

/** Open PRs whose head branch is `delete/*` -> Map<slug, html_url>. */
export async function listOpenDeletePRs(): Promise<Map<string, string>> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&per_page=100`);
  if (!res.ok) throw new Error(`listOpenDeletePRs: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { head: { ref: string }; html_url: string }[];
  const map = new Map<string, string>();
  for (const pr of prs) {
    const ref = pr.head?.ref ?? "";
    if (ref.startsWith("delete/")) map.set(ref.slice("delete/".length), pr.html_url);
  }
  return map;
}

/** Close a PR without merging (PATCH state=closed). */
export async function closePullRequest(number: number): Promise<void> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls/${number}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
  if (!res.ok) throw new Error(`closePullRequest ${number}: ${res.status} ${await res.text()}`);
}
