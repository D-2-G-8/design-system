// Light Postgres job store for the admin app. This tracks JOB state only
// (queued/running/done/failed, progress, logs) -- component state itself
// lives in git, not here. The actual generation work runs as a GitHub
// Actions workflow (see .github/workflows/generate.yml); this module is
// just bookkeeping for that dispatch.
//
// IMPORTANT: JOB_DB_URL is read lazily (inside getSql(), only when a
// function here is actually called) so that `next build` succeeds with no
// env configured at all -- module-level env reads would break that.
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
}

let sql: postgres.Sql | undefined;

function getSql(): postgres.Sql {
  if (!sql) {
    const url = process.env.JOB_DB_URL;
    if (!url) {
      throw new Error("JOB_DB_URL is not set");
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
