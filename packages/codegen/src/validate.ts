import { runDeterministicGates } from "./review/deterministic";
import type { GeneratedFiles, Finding, ReviewContext } from "./review";
import { buildOwnProps, buildComposedProps, buildExpectedComposedImports } from "./review/prop-types";
import { toCssVarName, type TokenForCss } from "./tokens";
import type { ComponentContract, ComponentForCodegen } from "./component";
import { findingsForComponent, parseTscOutput } from "./tsc-runner";
import type { StoredComponentContract } from "./types";

export interface GateInput {
  componentName: string;
  fileBase: string;
  contract: ComponentContract;
  tokens: TokenForCss[];
  uses: { slug: string; componentName: string; isIcon: boolean }[];
  childContracts: Map<string, StoredComponentContract>;
}

/** Assemble the ReviewContext (same pieces generateComponentCodeReviewed uses)
 *  and run the deterministic gates over the written files. Re-run each round to
 *  catch a holisticFix that reintroduced a gate violation. */
export function gateComponent(files: GeneratedFiles, input: GateInput): Finding[] {
  const ctx: ReviewContext = {
    componentName: input.componentName,
    fileBase: input.fileBase,
    tokenVarNames: new Set(input.tokens.map((t) => toCssVarName(t.name))),
    ownProps: buildOwnProps(input.contract),
    composedProps: buildComposedProps(input.uses, input.childContracts),
    expectedComposedImports: buildExpectedComposedImports(input.uses, false),
  };
  return runDeterministicGates(files, ctx);
}

export interface ValidationArgs extends GateInput {
  model: string;
  component: ComponentForCodegen;
  files: GeneratedFiles;
  isIcon: boolean;
  maxRounds?: number;
  // Injected side effects (real ones in the CLI; fakes in tests):
  typecheck: () => Promise<{ ok: boolean; raw: string }>;
  write: (files: GeneratedFiles) => Promise<void>;
  fix: (files: GeneratedFiles, findings: { file: string; message: string }[]) => Promise<{ files: GeneratedFiles; inputTokens: number; outputTokens: number }>;
  // Optional override for the deterministic gate (tests inject a stub); defaults to gateComponent.
  gate?: (files: GeneratedFiles) => Finding[];
}

export interface ValidationResult {
  passed: boolean;
  rounds: number;
  findings: { file: string; message: string }[];
  files: GeneratedFiles;
}

export async function runValidationLoop(args: ValidationArgs): Promise<ValidationResult> {
  const maxRounds = args.maxRounds ?? 3;
  const gate = args.gate ?? ((f: GeneratedFiles) => gateComponent(f, args));
  let files = args.files;
  let rounds = 0;

  for (;;) {
    await args.write(files);
    const tsc = await args.typecheck();
    const tscFindings = tsc.ok
      ? []
      : findingsForComponent(parseTscOutput(tsc.raw), args.component.slug, args.isIcon);
    const gateFindings = gate(files)
      .filter((f) => f.severity === "build-breaking")
      .map((f) => ({ file: f.file, message: f.message }));
    const findings = [...tscFindings, ...gateFindings];

    if (findings.length === 0) return { passed: true, rounds, findings: [], files };
    // Icons are deterministic — no LLM fix; report and stop.
    if (args.isIcon) return { passed: false, rounds, findings, files };
    if (rounds >= maxRounds) return { passed: false, rounds, findings, files };

    const fixed = await args.fix(files, findings);
    files = fixed.files;
    rounds++;
  }
}
