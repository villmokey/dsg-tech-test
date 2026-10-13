import { describe, expect, it } from "vitest";
import {
  applyCartChange,
  combinedQuantityForProduct,
  priceCart,
  remainingQuotaForProduct,
  validateCartForCheckout,
} from "@/lib/marketplace/pricing";
import type { CartLine, PackageId, Product } from "@/lib/types";

function makeProduct(overrides: Partial<Product> = {}): Product {
  const pkg = (id: PackageId, monthlyPrice: number) => ({
    id,
    name: id,
    monthlyPrice,
    regularMonthlyPrice: null,
    highlights: [],
  });
  return {
    id: "pos",
    slug: "kodeva-pos",
    name: "Kodeva POS",
    category: "pos",
    unit: "outlet",
    tagline: "",
    description: "",
    features: [],
    images: [],
    promoQuotaRemaining: 20,
    promoQuotaTotal: 100,
    packages: [pkg("basic", 100), pkg("pro", 200), pkg("business", 300)],
    ...overrides,
  };
}

describe("priceCart", () => {
  it("computes line totals and subtotal", () => {
    const product = makeProduct();
    const other = makeProduct({ id: "payroll", name: "Kodeva Payroll" });
    const lines: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 3 },
      { productId: "payroll", packageId: "pro", quantity: 2 },
    ];
    const totals = priceCart([product, other], lines);
    expect(totals.subtotal).toBe(3 * 100 + 2 * 200);
    expect(totals.totalQuantity).toBe(5);
    expect(totals.lines[0].lineTotal).toBe(300);
    expect(totals.lines[0].unitPrice).toBe(100);
  });

  it("drops lines whose product no longer exists instead of crashing", () => {
    const product = makeProduct();
    const totals = priceCart(
      [product],
      [{ productId: "gone", packageId: "basic", quantity: 1 }],
    );
    expect(totals.lines).toHaveLength(0);
    expect(totals.subtotal).toBe(0);
  });
});

describe("combinedQuantityForProduct", () => {
  it("sums across package variants of the same product", () => {
    const lines: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 5 },
      { productId: "pos", packageId: "business", quantity: 4 },
      { productId: "payroll", packageId: "basic", quantity: 3 },
    ];
    expect(combinedQuantityForProduct(lines, "pos")).toBe(9);
    expect(combinedQuantityForProduct(lines, "payroll")).toBe(3);
  });
});

describe("applyCartChange", () => {
  it("adds a new row within quota", () => {
    const product = makeProduct();
    const result = applyCartChange([], {
      product,
      packageId: "basic",
      quantity: 10,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lines).toEqual([
        { productId: "pos", packageId: "basic", quantity: 10 },
      ]);
    }
  });

  it("replaces an existing row with the absolute target quantity", () => {
    // Contract: applyCartChange sets the ABSOLUTE quantity of the row (0
    // removes it). Store-level "add N more" computes the absolute target
    // before calling this (see cart-store addItem).
    const product = makeProduct();
    const existing: CartLine[] = [
      { productId: "pos", packageId: "pro", quantity: 4 },
    ];
    const result = applyCartChange(existing, {
      product,
      packageId: "pro",
      quantity: 10,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lines).toEqual([
        { productId: "pos", packageId: "pro", quantity: 10 },
      ]);
    }
  });

  it("enforces quota across combined variants and rejects the exceeding row", () => {
    const product = makeProduct({ promoQuotaRemaining: 20 });
    const existing: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 15 },
      { productId: "pos", packageId: "pro", quantity: 3 },
    ];
    // Combined is already 18; 5 more would hit 23 > 20.
    const result = applyCartChange(existing, {
      product,
      packageId: "business",
      quantity: 5,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.maxAllowedForLine).toBe(2);
      expect(result.error.maxAllowed).toBe(2);
    }
  });

  it("allows exactly up to the quota", () => {
    const product = makeProduct({ promoQuotaRemaining: 20 });
    const result = applyCartChange([], {
      product,
      packageId: "basic",
      quantity: 20,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects zero or negative quantities", () => {
    const product = makeProduct();
    const result = applyCartChange([], {
      product,
      packageId: "basic",
      quantity: -1,
    });
    expect(result.ok).toBe(false);
  });

  it("removes a row when quantity is 0", () => {
    const product = makeProduct();
    const existing: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 5 },
      { productId: "pos", packageId: "pro", quantity: 2 },
    ];
    const result = applyCartChange(existing, {
      product,
      packageId: "basic",
      quantity: 0,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.lines).toEqual([
        { productId: "pos", packageId: "pro", quantity: 2 },
      ]);
    }
  });

  it("does not mutate the input array", () => {
    const product = makeProduct();
    const existing: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 1 },
    ];
    applyCartChange(existing, { product, packageId: "basic", quantity: 5 });
    expect(existing[0].quantity).toBe(1);
  });
});

describe("remainingQuotaForProduct", () => {
  it("subtracts combined cart quantity from remaining quota", () => {
    const product = makeProduct({ promoQuotaRemaining: 20 });
    const lines: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 6 },
      { productId: "pos", packageId: "pro", quantity: 4 },
      { productId: "payroll", packageId: "basic", quantity: 10 },
    ];
    expect(remainingQuotaForProduct(product, lines)).toBe(10);
  });

  it("never goes negative", () => {
    const product = makeProduct({ promoQuotaRemaining: 5 });
    const lines: CartLine[] = [
      { productId: "pos", packageId: "basic", quantity: 8 },
    ];
    expect(remainingQuotaForProduct(product, lines)).toBe(0);
  });
});

describe("validateCartForCheckout", () => {
  it("passes a cart within quota", () => {
    const pos = makeProduct();
    const payroll = makeProduct({
      id: "payroll",
      name: "Kodeva Payroll",
      promoQuotaRemaining: 4,
    });
    const result = validateCartForCheckout([pos, payroll], [
      { productId: "pos", packageId: "basic", quantity: 5 },
      { productId: "payroll", packageId: "pro", quantity: 4 },
    ]);
    expect(result.ok).toBe(true);
  });

  it("flags the first product whose combined quantity exceeds quota", () => {
    const pos = makeProduct({ promoQuotaRemaining: 10 });
    const result = validateCartForCheckout([pos], [
      { productId: "pos", packageId: "basic", quantity: 7 },
      { productId: "pos", packageId: "business", quantity: 5 },
    ]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.productId).toBe("pos");
      expect(result.maxAllowed).toBe(10);
    }
  });

  it("flags a product that is no longer in the catalog", () => {
    const result = validateCartForCheckout([], [
      { productId: "gone", packageId: "basic", quantity: 1 },
    ]);
    expect(result.ok).toBe(false);
  });
});
