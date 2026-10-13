import { getProducts } from "@/lib/content";

/**
 * GET /api/products — mock API over the same content layer the pages use.
 * Part of the documented mock-API surface for the frontend-only marketplace;
 * in a real backend this is the products endpoint (see README integration
 * plan).
 *
 * Reviewers can force a failure with ?simulate=error to inspect how clients
 * handle API errors.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("simulate") === "error") {
    return Response.json(
      { ok: false, error: "Simulated mock API failure" },
      { status: 500 },
    );
  }
  const products = await getProducts();
  return Response.json({ ok: true, count: products.length, products });
}
