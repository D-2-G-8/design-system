// Light Postgres job store for the admin app. This tracks JOB state only
// (queued/running/done/failed, progress, logs) -- component state itself
// lives in git, not here. The actual generation work runs as a GitHub
// Actions workflow (see .github/workflows/generate.yml); this module is
// just bookkeeping for that dispatch.
//
// Connection string: prefer JOB_DB_URL (an explicit override), else fall back
// to POSTGRES_URL -- the var Vercel Postgres/Neon injects automatically -- so
// attaching a Vercel Postgres to this project just works with no extra env.
// Read lazily (inside getSql(), only when a function here is actually called)
// so that `next build` succeeds with no env configured at all.
import postgres from "postgres";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job {
  id: string;
  kind: string;
  slug: string;
  status: JobStatus;
  workflow_run_id: string | null; // bigint -> returned as string by postgres.js
  progress: number;
  log: string | null;
  created_at: Date;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
}

let sql: postgres.Sql | undefined;

function getSql(): postgres.Sql {
  if (!sql) {
    const url = process.env.JOB_DB_URL ?? process.env.POSTGRES_URL;
    if (!url) {
      throw new Error("No database URL: set POSTGRES_URL (auto-injected by Vercel Postgres) or JOB_DB_URL.");
    }
    sql = postgres(url, { max: 1 });
  }
  return sql;
}

/**
 * Idempotent table creation, safe to call on every cold start / before
 * every query. No separate migration runner in this skeleton.
 */
export async function ensureTable(): Promise<void> {
  const db = getSql();
  await db`
    CREATE TABLE IF NOT EXISTS job (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      kind text NOT NULL,
      slug text NOT NULL,
      status text NOT NULL DEFAULT 'queued',
      workflow_run_id bigint,
      progress int NOT NULL DEFAULT 0,
      log text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  await db`ALTER TABLE job ADD COLUMN IF NOT EXISTS input_tokens int`;
  await db`ALTER TABLE job ADD COLUMN IF NOT EXISTS output_tokens int`;
  await db`ALTER TABLE job ADD COLUMN IF NOT EXISTS cost_usd double precision`;
}

export async function enqueue(kind: string, slug: string): Promise<Job> {
  const db = getSql();
  await ensureTable();
  const [job] = await db<Job[]>`
    INSERT INTO job (kind, slug, status)
    VALUES (${kind}, ${slug}, 'queued')
    RETURNING *
  `;
  return job;
}

export async function get(id: string): Promise<Job | undefined> {
  const db = getSql();
  await ensureTable();
  const [job] = await db<Job[]>`SELECT * FROM job WHERE id = ${id}`;
  return job;
}

export async function list(): Promise<Job[]> {
  const db = getSql();
  await ensureTable();
  return db<Job[]>`SELECT * FROM job ORDER BY created_at DESC`;
}

export async function setStatus(
  id: string,
  status: JobStatus,
  patch: Partial<Pick<Job, "workflow_run_id" | "progress" | "log">> = {},
): Promise<Job | undefined> {
  const db = getSql();
  await ensureTable();
  const [job] = await db<Job[]>`
    UPDATE job
    SET status = ${status},
        workflow_run_id = COALESCE(${patch.workflow_run_id ?? null}, workflow_run_id),
        progress = COALESCE(${patch.progress ?? null}, progress),
        log = COALESCE(${patch.log ?? null}, log)
    WHERE id = ${id}
    RETURNING *
  `;
  return job;
}

export async function setUsage(
  id: string,
  u: { inputTokens: number; outputTokens: number; costUsd: number },
): Promise<void> {
  const db = getSql();
  await ensureTable();
  await db`
    UPDATE job
    SET input_tokens = ${u.inputTokens}, output_tokens = ${u.outputTokens}, cost_usd = ${u.costUsd}
    WHERE id = ${id}
  `;
}
