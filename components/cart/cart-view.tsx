"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatPrice, formatNumber } from "@/lib/site-config";
import { useCartStore } from "@/lib/marketplace/cart-store";
import { combinedQuantityForProduct, priceCart } from "@/lib/marketplace/pricing";
import type { Product } from "@/lib/types";

/**
 * Cart view. All money flows through the pricing engine; quota errors come
 * from the store (set by rejected add/update actions) and surface as a toast.
 */
export function CartView({ products }: { products: Product[] }) {
  const lines = useCartStore((state) => state.lines);
  const lastError = useCartStore((state) => state.lastError);
  const dismissError = useCartStore((state) => state.dismissError);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const totals = useMemo(() => priceCart(products, lines), [products, lines]);

  if (totals.lines.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-muted/60 p-10 text-center">
        <p className="text-lg font-semibold">Keranjangmu kosong</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Jelajahi katalog dan tambahkan produk untuk mulai.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Lihat Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-4">
        {lastError ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          >
            <span>{lastError.message}</span>
            <button
              type="button"
              onClick={dismissError}
              className="shrink-0 font-semibold underline"
            >
              Tutup
            </button>
          </div>
        ) : null}

        <ul className="flex flex-col gap-4">
          {totals.lines.map((line) => {
            const product = products.find((p) => p.id === line.productId);
            const combined = combinedQuantityForProduct(lines, line.productId);
            const atQuota =
              product !== undefined && combined >= product.promoQuotaRemaining;
            return (
              <li
                key={`${line.productId}:${line.packageId}`}
                className="rounded-2xl border border-border bg-background p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {line.productName}{" "}
                      <span className="text-sm font-medium text-muted-foreground">
                        · Paket {line.packageName}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatPrice(line.unitPrice)} / {line.unit} / bulan
                      {line.regularUnitPrice ? (
                        <span className="ml-2 line-through">
                          {formatPrice(line.regularUnitPrice)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <p className="font-semibold text-brand">
                    {formatPrice(line.lineTotal)}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          product as Product,
                          line.packageId,
                          line.quantity - 1,
                        )
                      }
                      aria-label={`Kurangi ${line.productName} paket ${line.packageName}`}
                      className="h-9 w-9 rounded-lg border border-border transition-colors hover:bg-muted"
                    >
                      −
                    </button>
                    <span
                      aria-label={`Jumlah ${line.quantity}`}
                      className="min-w-10 text-center text-sm font-semibold"
                    >
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          product as Product,
                          line.packageId,
                          line.quantity + 1,
                        )
                      }
                      aria-label={`Tambah ${line.productName} paket ${line.packageName}`}
                      className="h-9 w-9 rounded-lg border border-border transition-colors hover:bg-muted"
                    >
                      +
                    </button>
                    {atQuota ? (
                      <span className="ml-2 text-xs font-medium text-amber-600">
                        Kuota promo maksimal ({combined} {line.unit})
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId, line.packageId)}
                    className="text-sm font-medium text-muted-foreground underline hover:text-foreground"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside
        aria-label="Ringkasan pesanan"
        className="rounded-2xl border border-border bg-muted/60 p-5 lg:sticky lg:top-24"
      >
        <h2 className="text-lg font-bold">Ringkasan</h2>
        <dl className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Jumlah lisensi</dt>
            <dd className="font-semibold">{formatNumber(totals.totalQuantity)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <dt className="font-semibold">Subtotal / bulan</dt>
            <dd className="font-bold text-brand">
              {formatPrice(totals.subtotal)}
            </dd>
          </div>
        </dl>
        <Link
          href="/checkout"
          className="mt-5 flex h-12 items-center justify-center rounded-full bg-brand font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Lanjut ke Checkout
        </Link>
        <Link
          href="/products"
          className="mt-3 flex h-11 items-center justify-center rounded-full border border-border text-sm font-medium transition-colors hover:bg-muted"
        >
          Tambah produk lain
        </Link>
      </aside>
    </div>
  );
}
