// Thin GitHub REST client used to dispatch and poll the generate.yml
// worker workflow. GITHUB_TOKEN / GITHUB_DESIGN_SYSTEM_REPO are read
// lazily (inside getConfig(), only when a function here is actually
// called) so that `next build` succeeds with no env configured at all.
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
