"use client";

import { useMemo, useState } from "react";
import { formatPrice, formatNumber } from "@/lib/site-config";
import { toEcommerceItem, trackAddToCart } from "@/lib/analytics/data-layer";
import { useViewItem } from "@/lib/analytics/use-view-item";
import { useCartStore } from "@/lib/marketplace/cart-store";
import {
  combinedQuantityForProduct,
  remainingQuotaForProduct,
} from "@/lib/marketplace/pricing";
import type { PackageId, Product } from "@/lib/types";

/**
 * Package selection: Basic / Pro / Business. Selecting a package updates the
 * displayed price and dependent totals immediately. Quota is enforced across
 * the combined quantity of the same product (all variants) via the pricing
 * engine — an add that would exceed the remaining quota is rejected with a
 * clear message.
 */
export function PackageSelector({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState<PackageId>("basic");
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
    at: number;
  } | null>(null);

  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);

  const selected = useMemo(
    () =>
      product.packages.find((pkg) => pkg.id === selectedId) ??
      product.packages[0],
    [product, selectedId],
  );

  const currentRowQty = useMemo(
    () =>
      lines.find(
        (line) =>
          line.productId === product.id && line.packageId === selected.id,
      )?.quantity ?? 0,
    [lines, product.id, selected.id],
  );

  const combinedQty = combinedQuantityForProduct(lines, product.id);
  const remainingQuota = remainingQuotaForProduct(product, lines);
  // Max for THIS row: quota minus other variants' quantities in the cart.
  const maxForLine = Math.max(
    0,
    product.promoQuotaRemaining - (combinedQty - currentRowQty),
  );

  // Fire view_item once per product/package combination (guard inside hook).
  useViewItem(product, selected.id);

  function handlePackageChange(packageId: PackageId) {
    setSelectedId(packageId);
    setNotice(null);
  }

  function changeQuantity(next: number) {
    setQuantity(Math.min(Math.max(1, next), Math.max(1, maxForLine)));
  }

  function handleAddToCart() {
    const target = selected;
    const result = addItem(product, target.id, quantity);
    if (!result.ok) {
      setNotice({
        kind: "error",
        text: result.error.message,
        at: Date.now(),
      });
      return;
    }
    trackAddToCart(
      toEcommerceItem(product, target.id, quantity),
      target.monthlyPrice * quantity,
    );
    setNotice({
      kind: "success",
      text: `${target.name} — ${quantity} ${product.unit} ditambahkan ke keranjang.`,
      at: Date.now(),
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="Pilih paket"
        className="grid grid-cols-3 gap-2"
      >
        {product.packages.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            aria-pressed={pkg.id === selected.id}
            onClick={() => handlePackageChange(pkg.id)}
            className={`flex h-11 items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
              pkg.id === selected.id
                ? "border-brand bg-brand text-white"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {pkg.name}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold tracking-tight">
            {formatPrice(selected.monthlyPrice)}
          </span>
          {selected.regularMonthlyPrice !== null ? (
            <span className="text-base text-muted-foreground line-through">
              {formatPrice(selected.regularMonthlyPrice)}
            </span>
          ) : null}
          <span className="text-sm text-muted-foreground">
            /{product.unit}/bulan
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Total: {formatPrice(selected.monthlyPrice * quantity)} untuk{" "}
          {formatNumber(quantity)} {product.unit} per bulan
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {selected.highlights.map((highlight) => (
            <li
              key={highlight}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span aria-hidden="true" className="mt-0.5 text-emerald-600">
                ✓
              </span>
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label
            htmlFor="package-quantity"
            className="mb-1 block text-sm font-medium"
          >
            Jumlah {product.unit === "outlet" ? "outlet" : "pengguna"}
          </label>
          <div className="flex h-11 items-stretch">
            <button
              type="button"
              onClick={() => changeQuantity(quantity - 1)}
              disabled={quantity <= 1}
              aria-label="Kurangi jumlah"
              className="w-11 rounded-l-lg border border-border text-lg transition-colors hover:bg-muted disabled:opacity-40"
            >
              −
            </button>
            <input
              id="package-quantity"
              type="number"
              inputMode="numeric"
              min={1}
              max={maxForLine}
              value={quantity}
              onChange={(event) =>
                changeQuantity(Number(event.target.value) || 1)
              }
              className="w-16 border-y border-border bg-background text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => changeQuantity(quantity + 1)}
              disabled={quantity >= maxForLine}
              aria-label="Tambah jumlah"
              className="w-11 rounded-r-lg border border-border text-lg transition-colors hover:bg-muted disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="h-11 flex-1 rounded-full bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-strong sm:flex-none"
        >
          Tambah ke Keranjang
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Sisa kuota promo produk ini:{" "}
        <span className="font-semibold text-foreground">
          {formatNumber(remainingQuota)} {product.unit}
        </span>{" "}
        (terhitung dari total lisensi {product.name} di keranjang, semua paket).
      </p>

      <p aria-live="polite" role="status">
        {notice ? (
          <span
            className={
              notice.kind === "success"
                ? "text-sm font-medium text-emerald-600"
                : "text-sm font-medium text-red-600"
            }
          >
            {notice.text}
          </span>
        ) : null}
      </p>
    </div>
  );
}
