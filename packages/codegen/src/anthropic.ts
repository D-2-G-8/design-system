import { createAnthropic } from "@ai-sdk/anthropic";
import { DEFAULT_MODEL_ID } from "./models";

/**
 * Single-service-token Anthropic client for the codegen package. The platform's
 * per-session / multi-tenant token handling was its job -- here one service
 * token (ANTHROPIC_API_KEY, from the Actions secret) drives every call, with an
 * optional ANTHROPIC_BASE_URL to route through a proxy/gateway.
 *
 * Kept callable as `await getAnthropicClient()` so the ported modules
 * (reviewer/visual-diff/component) that `await` it need no edit beyond the
 * import path.
 */
export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set -- the codegen worker needs it to call the model.");
  }
  const baseURL = process.env.ANTHROPIC_BASE_URL || undefined;
  return createAnthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

/**
 * The model id a codegen run should use: CODEGEN_MODEL env override, else the
 * package default (a current Claude id). Replaces the platform's per-user/DB
 * getEffectiveModel(workspaceId, "design-system-codegen").
 */
export function getCodegenModel(): string {
  return process.env.CODEGEN_MODEL || DEFAULT_MODEL_ID;
}
