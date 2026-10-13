import { getProducts } from "@/lib/content";
import {
  priceCart,
  validateCartForCheckout,
} from "@/lib/marketplace/pricing";
import {
  orderSchema,
  simulatePaymentOutcome,
} from "@/lib/validation";
import type { MockOrderPayload } from "@/lib/types";

/**
 * POST /api/orders — mock payment processor (frontend-only marketplace; no
 * real backend, database, or payment integration).
 *
 * Contract for the future real backend (documented in README):
 * - Buyer details validated server-side; prices and quota recomputed from
 *   the catalog, never trusted from the client.
 * - Promo quota enforced across combined quantities per product.
 * - Payment outcome simulated deterministically (emails containing "+fail").
 * - UTM attribution is carried into the stored order payload.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Body bukan JSON yang valid." },
      { status: 400 },
    );
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Data pesanan tidak valid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const { buyer, items, utm } = parsed.data;

  // Simulated gateway latency so loading states are observable.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const catalog = await getProducts();

  const quotaCheck = validateCartForCheckout(catalog, items);
  if (!quotaCheck.ok) {
    const product = catalog.find((p) => p.id === quotaCheck.productId);
    return Response.json(
      {
        ok: false,
        error: `Kuota promo untuk ${
          product?.name ?? quotaCheck.productId
        } tersisa ${quotaCheck.maxAllowed}. Kurangi jumlah lisensi.`,
      },
      { status: 422 },
    );
  }

  // Prices are computed server-side from the catalog, never from the client.
  const totals = priceCart(catalog, quotaCheck.lines);

  const outcome = simulatePaymentOutcome(buyer.email);

  const order: MockOrderPayload = {
    orderId: crypto.randomUUID().slice(0, 8).toUpperCase(),
    buyer,
    items: totals.lines.map((line) => ({
      productId: line.productId,
      productName: line.productName,
      packageId: line.packageId,
      packageName: line.packageName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      lineTotal: line.lineTotal,
    })),
    subtotal: totals.subtotal,
    totalQuantity: totals.totalQuantity,
    utm: utm
      ? {
          ...utm,
          capturedAt: utm.capturedAt ?? new Date().toISOString(),
        }
      : null,
    paymentStatus: outcome.status,
    ...(outcome.failureReason ? { failureReason: outcome.failureReason } : {}),
    createdAt: new Date().toISOString(),
  };

  // Mock persistence: in a real backend this is where the order is stored,
  // the payment initiated, and license delivery triggered after webhook
  // verification. Here the payload is returned and logged as evidence.
  console.info("[api/orders] mock order", {
    orderId: order.orderId,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    utm: order.utm,
  });

  return Response.json({ ok: true, order });
}
