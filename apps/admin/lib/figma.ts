// Admin-side Figma render client, used to inline a design node as a data
// URL for the review page. Uses the admin's own FIGMA_ACCESS_TOKEN (either
// a PAT, prefixed `figd_`, or an OAuth token) -- callers pass the token in.

type FetchLike = typeof fetch;

/** Render Figma nodes → nodeId→URL map (X-Figma-Token PAT or Bearer OAuth). */
export async function getFileImages(
  fileKey: string,
  nodeIds: string[],
  token: string,
  { format = "png", scale = 2 }: { format?: "png" | "svg" | "jpg"; scale?: number } = {},
  fetchImpl: FetchLike = fetch,
): Promise<Record<string, string | null>> {
  const ids = encodeURIComponent(nodeIds.join(","));
  const headers: Record<string, string> = token.startsWith("figd_")
    ? { "X-Figma-Token": token }
    : { Authorization: `Bearer ${token}` };
  const res = await fetchImpl(
    `https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`,
    { headers, signal: AbortSignal.timeout(20_000) },
  );
  if (!res.ok) throw new Error(`Figma images ${res.status}`);
  const data = (await res.json()) as { images?: Record<string, string | null>; err?: string | null };
  if (data.err) throw new Error(`Figma render: ${data.err}`);
  return data.images ?? {};
}

/** Render one node and inline it as a data URL, or null if it can't render.
 *  Best-effort (advisory review context -- never throws). Deps injectable. */
export async function fetchNodeImageDataUrl(
  fileKey: string,
  nodeId: string,
  token: string,
  deps: { getImages?: typeof getFileImages; fetchImpl?: FetchLike } = {},
): Promise<string | null> {
  const getImages = deps.getImages ?? getFileImages;
  const fetchImpl = deps.fetchImpl ?? fetch;
  try {
    const images = await getImages(fileKey, [nodeId], token, {}, fetchImpl);
    const url = images[nodeId];
    if (!url) return null;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}
