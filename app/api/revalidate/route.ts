import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

/**
 * POST /api/revalidate — Sanity webhook target.
 *
 * Configure a Sanity webhook (see README) that POSTs here when content is
 * created/updated/published. Publishing a change revalidates the `content`
 * tag so the site picks it up on the next request — no manual redeploy.
 *
 * Auth: `x-webhook-secret` header (or ?secret= query) must match
 * SANITY_REVALIDATE_SECRET. Expected propagation: the next page visit
 * regenerates content (typically < 1s after publish; CDN may add a few
 * seconds). Old content is served stale-while-revalidate in the interim.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret =
    request.headers.get("x-webhook-secret") ??
    url.searchParams.get("secret") ??
    "";
  const expected = process.env.SANITY_REVALIDATE_SECRET ?? "";

  if (!expected || secret !== expected) {
    return Response.json(
      { revalidated: false, error: "Invalid secret" },
      { status: 401 },
    );
  }

  revalidateTag(CONTENT_TAG, "max");

  return Response.json({ revalidated: true, tag: CONTENT_TAG, now: Date.now() });
}
