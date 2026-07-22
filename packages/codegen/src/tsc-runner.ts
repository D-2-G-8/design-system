import { execFile } from "node:child_process";

export interface TscError {
  file: string;
  line: number;
  message: string;
}

// Matches tsc's default pretty=false line: "path(line,col): error TSxxxx: msg".
// tsc runs with cwd = packages/components, so `file` is repo-relative to that
// package (e.g. "src/components/button/Button.tsx").
const TSC_LINE = /^(.+?)\((\d+),\d+\):\s+(error TS\d+:.*)$/;

export function parseTscOutput(raw: string): TscError[] {
  const out: TscError[] = [];
  for (const line of raw.split("\n")) {
    const m = TSC_LINE.exec(line.trim());
    if (m) out.push({ file: m[1], line: Number(m[2]), message: m[3] });
  }
  return out;
}

/** Keep only errors whose file is under this component's own dir; sibling
 *  components' pre-existing errors are not this run's job (CI catches the
 *  whole library). */
export function findingsForComponent(
  errors: TscError[],
  slug: string,
  isIcon: boolean,
): { file: string; message: string }[] {
  const dir = `src/${isIcon ? "icons" : "components"}/${slug}/`;
  return errors.filter((e) => e.file.startsWith(dir)).map((e) => ({ file: e.file, message: e.message }));
}

/** Spawn a real typecheck of the component library. Returns ok=true on exit 0.
 *  tsc writes diagnostics to stdout; we combine stdout+stderr into `raw`. */
export function runPackageTypecheck(repoRoot: string): Promise<{ ok: boolean; raw: string }> {
  return new Promise((resolve) => {
    execFile(
      "corepack",
      ["pnpm", "-F", "@d-2-g-8/design-system", "typecheck"],
      { cwd: repoRoot, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => {
        resolve({ ok: !err, raw: `${stdout ?? ""}\n${stderr ?? ""}` });
      },
    );
  });
}
