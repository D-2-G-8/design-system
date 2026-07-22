import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Bearer-token gate for the admin's API routes. Compares the request's
 * `Authorization: Bearer <token>` against ADMIN_TOKEN in constant time.
 *
 * FAIL-CLOSED: if ADMIN_TOKEN is unset, EVERY request is denied -- a public
 * Vercel deployment must never dispatch workflows (which spend LLM/Figma/CI
 * resources) or leak job data just because the operator forgot to configure a
 * secret. In production also enable Vercel deployment protection (belt-and-
 * suspenders); a session-based login replaces this bearer check in the
 * admin-UI phase (Phase 4).
 *
 * Read lazily (inside the handler) so `next build` with no env still works.
 * Returns a 401 NextResponse when unauthorized, or null when the request may
 * proceed.
 */
export function requireAdmin(request: Request): NextResponse | null {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Admin auth is not configured (set ADMIN_TOKEN)." },
      { status: 401 },
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
