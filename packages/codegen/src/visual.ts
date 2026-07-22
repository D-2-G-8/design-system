import type { Finding } from "./review";

export interface VisualResult {
  slug: string;
  ran: boolean;
  findings: Finding[];
  model: string;
}

interface RenderedImage { bytes: Uint8Array; mediaType: string }

export interface RunVisualReviewArgs {
  slug: string;
  componentName: string;
  fileKey: string;
  nodeId: string; // "" when the component has no figmaNodeIds
  token: string;
  model: string;
  spec?: string;
  // Injected side effects:
  readRendered: () => RenderedImage | null;
  fetchImage: (fileKey: string, nodeId: string, token: string) => Promise<RenderedImage | null>;
  reviewDiff: (
    model: string,
    figma: RenderedImage,
    rendered: RenderedImage,
    componentName: string,
    spec?: string,
  ) => Promise<{ findings: Finding[]; inputTokens: number; outputTokens: number }>;
}

/** Advisory visual review: vision-diff the rendered Storybook screenshot vs the
 *  Figma render. ran:false (no findings) whenever an input is missing (no
 *  nodeId, no rendered screenshot, Figma can't render) -- never throws for those
 *  (visual is advisory). */
export async function runVisualReview(args: RunVisualReviewArgs): Promise<VisualResult> {
  const nil = (): VisualResult => ({ slug: args.slug, ran: false, findings: [], model: args.model });
  if (!args.nodeId) return nil();
  const rendered = args.readRendered();
  if (!rendered) return nil();
  // A transient Figma render/rate-limit error degrades to an advisory skip
  // (ran:false) rather than crashing the CLI -- getFileImages throws on a
  // non-200/err, and visual review must never fail the run on its own.
  let figma: RenderedImage | null;
  try {
    figma = await args.fetchImage(args.fileKey, args.nodeId, args.token);
  } catch {
    return nil();
  }
  if (!figma) return nil();
  const { findings } = await args.reviewDiff(args.model, figma, rendered, args.componentName, args.spec);
  return { slug: args.slug, ran: true, findings, model: args.model };
}
