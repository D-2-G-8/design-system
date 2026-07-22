import { getFileImages } from "./figma";

/**
 * Fetch a Figma node's rendered PNG bytes (mirrors icon-fetch.ts: Figma's
 * images API returns a short-lived URL, which we then download). Returns null
 * when the node can't render or the download fails -- the caller degrades to a
 * "no visual review" result rather than failing the run. Deps are
 * injectable so this is unit-testable without network.
 */
export async function fetchNodeImage(
  fileKey: string,
  nodeId: string,
  accessToken: string,
  deps: { getImages?: typeof getFileImages; fetchImpl?: typeof fetch } = {},
): Promise<{ bytes: Uint8Array; mediaType: string } | null> {
  const getImages = deps.getImages ?? getFileImages;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const images = await getImages(fileKey, [nodeId], accessToken, { format: "png", scale: 2 });
  const url = images[nodeId];
  if (!url) return null;
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) return null;
  return { bytes: new Uint8Array(await res.arrayBuffer()), mediaType: "image/png" };
}
