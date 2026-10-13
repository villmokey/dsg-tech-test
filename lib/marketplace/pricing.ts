import type {
  CartLine,
  CartTotals,
  PackageId,
  PricedCartLine,
  Product,
} from "@/lib/types";

/**
 * Single source of truth for every price, subtotal, and promo-quota
 * calculation. The cart store, product page, and checkout all call into this
 * module — no component computes money on its own.
 *
 * Promo quota rule: the remaining quota of a product constrains the COMBINED
 * quantity across all package variants of that product in the cart, not each
 * row in isolation.
 */

export class QuotaExceededError extends Error {
  readonly maxAllowed: number;

  constructor(productName: string, maxAllowed: number) {
    super(
      maxAllowed <= 0
        ? `Kuota promo untuk ${productName} sudah habis.`
        : `Kuota promo ${productName} tersisa ${maxAllowed}. Kurangi jumlah lisensi.`,
    );
    this.name = "QuotaExceededError";
    this.maxAllowed = maxAllowed;
  }
}

export function getPackage(
  product: Product,
  packageId: PackageId,
): Product["packages"][number] {
  const pkg = product.packages.find((p) => p.id === packageId);
  if (!pkg) {
    throw new Error(`Package ${packageId} not found on product ${product.id}`);
  }
  return pkg;
}

export function findProduct(
  catalog: Product[],
  productId: string,
): Product | undefined {
  return catalog.find((p) => p.id === productId);
}

export function priceLine(product: Product, line: CartLine): PricedCartLine {
  const pkg = getPackage(product, line.packageId);
  return {
    ...line,
    productName: product.name,
    packageName: pkg.name,
    unit: product.unit,
    unitPrice: pkg.monthlyPrice,
    regularUnitPrice: pkg.regularMonthlyPrice,
    lineTotal: pkg.monthlyPrice * line.quantity,
  };
}

export function priceCart(
  catalog: Product[],
  lines: CartLine[],
): CartTotals {
  const priced: PricedCartLine[] = [];
  for (const line of lines) {
    const product = findProduct(catalog, line.productId);
    if (!product) continue; // catalog changed; drop silently instead of crashing
    priced.push(priceLine(product, line));
  }
  return {
    lines: priced,
    subtotal: priced.reduce((sum, line) => sum + line.lineTotal, 0),
    totalQuantity: priced.reduce((sum, line) => sum + line.quantity, 0),
  };
}

/** Combined quantity across every package variant of one product. */
export function combinedQuantityForProduct(
  lines: CartLine[],
  productId: string,
): number {
  return lines
    .filter((line) => line.productId === productId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

/** How many more licenses of this product the promo quota still allows. */
export function remainingQuotaForProduct(
  product: Product,
  lines: CartLine[],
): number {
  return Math.max(
    0,
    product.promoQuotaRemaining - combinedQuantityForProduct(lines, product.id),
  );
}

export interface CartChangeRequest {
  product: Product;
  packageId: PackageId;
  /** Absolute target quantity for this cart row (0 removes the row). */
  quantity: number;
}

export type CartChangeResult =
  | { ok: true; lines: CartLine[] }
  | {
      ok: false;
      error: QuotaExceededError;
      /** The largest quantity the attempted row could have used. */
      maxAllowedForLine: number;
    };

/**
 * Validate then apply a single add/update against the full cart, enforcing the
 * promo quota across package variants of the same product. Returns a new
 * array; never mutates the input.
 */
export function applyCartChange(
  lines: CartLine[],
  request: CartChangeRequest,
): CartChangeResult {
  const { product, packageId, quantity } = request;

  if (!Number.isInteger(quantity) || quantity < 0) {
    return {
      ok: false,
      error: new QuotaExceededError(product.name, 0),
      maxAllowedForLine: 0,
    };
  }

  const otherLines = lines.filter(
    (line) => line.productId !== product.id || line.packageId !== packageId,
  );
  const otherQuantityForProduct = otherLines
    .filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + line.quantity, 0);

  const maxAllowedForLine = Math.max(
    0,
    product.promoQuotaRemaining - otherQuantityForProduct,
  );

  if (quantity > maxAllowedForLine) {
    return {
      ok: false,
      error: new QuotaExceededError(product.name, maxAllowedForLine),
      maxAllowedForLine,
    };
  }

  const nextLines = [...otherLines];
  if (quantity > 0) {
    nextLines.push({ productId: product.id, packageId, quantity });
  }
  return { ok: true, lines: nextLines };
}

/**
 * Final safety net before submitting an order: validates every line in the
 * cart against current quota (quotas may have changed after the cart was
 * persisted). Returns the ordered lines, or the first violating product.
 */
export function validateCartForCheckout(
  catalog: Product[],
  lines: CartLine[],
): { ok: true; lines: CartLine[] } | { ok: false; productId: string; maxAllowed: number } {
  const perProduct = new Map<string, number>();
  for (const line of lines) {
    perProduct.set(
      line.productId,
      (perProduct.get(line.productId) ?? 0) + line.quantity,
    );
  }
  for (const [productId, quantity] of perProduct) {
    const product = findProduct(catalog, productId);
    if (!product) {
      return { ok: false, productId, maxAllowed: 0 };
    }
    if (quantity > product.promoQuotaRemaining) {
      return {
        ok: false,
        productId,
        maxAllowed: product.promoQuotaRemaining,
      };
    }
  }
  return { ok: true, lines };
}
