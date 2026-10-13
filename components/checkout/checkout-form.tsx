"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getStoredUtm } from "@/lib/analytics/utm";
import { trackBeginCheckout } from "@/lib/analytics/data-layer";
import { useCartStore } from "@/lib/marketplace/cart-store";
import { priceCart } from "@/lib/marketplace/pricing";
import { formatPrice, formatNumber } from "@/lib/site-config";
import { orderSchema } from "@/lib/validation";
import type { MockOrderPayload, Product } from "@/lib/types";

type CheckoutStatus =
  | "form"
  | "submitting"
  | "success"
  | "failed"
  | "error";

const fieldClasses =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-brand";

/**
 * Checkout flow: buyer details + order summary, then a mock payment. Success
 * clears the cart; failure preserves it with a recovery path (retry or edit
 * cart). The order payload is built and validated server-side in /api/orders;
 * UTM attribution is attached from first-party storage.
 */
export function CheckoutForm({ products }: { products: Product[] }) {
  const lines = useCartStore((state) => state.lines);
  const clearCart = useCartStore((state) => state.clearCart);

  const [status, setStatus] = useState<CheckoutStatus>("form");
  const [order, setOrder] = useState<MockOrderPayload | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const beganRef = useRef(false);

  const totals = useMemo(() => priceCart(products, lines), [products, lines]);

  // begin_checkout fires once per mount while the cart has items.
  useEffect(() => {
    if (beganRef.current || totals.lines.length === 0) return;
    beganRef.current = true;
    trackBeginCheckout(
      totals.lines.map((line) => ({
        item_id: line.productId,
        item_name: line.productName,
        item_category: products.find((p) => p.id === line.productId)
          ?.category ?? "",
        item_variant: line.packageName,
        price: line.unitPrice,
        quantity: line.quantity,
        currency: "IDR",
        promotion_quota_remaining:
          products.find((p) => p.id === line.productId)?.promoQuotaRemaining ??
          0,
      })),
      totals.subtotal,
    );
  }, [totals, products]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      buyer: {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
      },
      items: lines,
      utm: getStoredUtm(),
    };

    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as
        | { ok: true; order: MockOrderPayload }
        | { ok: false; error: string };

      if (!response.ok || !result.ok) {
        setStatus("error");
        setMessage(
          "error" in result ? result.error : "Terjadi kesalahan. Coba lagi.",
        );
        return;
      }

      setOrder(result.order);
      if (result.order.paymentStatus === "success") {
        clearCart();
        setStatus("success");
      } else {
        setStatus("failed");
        setMessage(result.order.failureReason ?? "Pembayaran gagal.");
      }
    } catch {
      setStatus("error");
      setMessage(
        "Tidak dapat menghubungi server. Periksa koneksi dan coba lagi.",
      );
    }
  }

  if (totals.lines.length === 0 && status !== "success") {
    return (
      <div className="rounded-2xl border border-border bg-muted/60 p-10 text-center">
        <p className="text-lg font-semibold">Keranjangmu kosong</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Tambahkan produk ke keranjang terlebih dahulu.
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

  if (status === "success" && order) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-10 text-center dark:border-emerald-900 dark:bg-emerald-950">
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          Pembayaran berhasil
        </p>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">
          Pesanan <span className="font-mono font-semibold">{order.orderId}</span>{" "}
          sebesar {formatPrice(order.subtotal)} per bulan untuk{" "}
          {formatNumber(order.totalQuantity)} lisensi telah dibuat.
        </p>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-400">
          Untuk demo ini tidak ada pembayaran sungguhan. Konfirmasi lisensi
          akan dikirim ke {order.buyer.email} (simulasi).
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
        >
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const failed = status === "failed" && order !== null;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid items-start gap-8 lg:grid-cols-[1fr_360px]"
    >
      <div className="flex flex-col gap-5">
        {failed ? (
          <div
            role="alert"
            className="rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950"
          >
            <p className="font-semibold text-red-800 dark:text-red-300">
              Pembayaran gagal
            </p>
            <p className="mt-1 text-sm text-red-800 dark:text-red-400">
              {message}
            </p>
            <p className="mt-2 text-sm text-red-800 dark:text-red-400">
              Keranjangmu tetap tersimpan — perbaiki data atau coba lagi.
              ID pesanan: <span className="font-mono">{order.orderId}</span>
            </p>
          </div>
        ) : null}
        {status === "error" ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950"
          >
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Kesalahan
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-400">
              {message}
            </p>
          </div>
        ) : null}

        <fieldset className="rounded-2xl border border-border bg-background p-5 disabled:opacity-60" disabled={status === "submitting"}>
          <legend className="px-1 text-sm font-semibold">
            Data pembeli
          </legend>
          <div className="mt-3 flex flex-col gap-4">
            <div>
              <label htmlFor="buyer-name" className="mb-1 block text-sm font-medium">
                Nama <span aria-hidden="true">*</span>
              </label>
              <input
                id="buyer-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className={fieldClasses}
                aria-invalid={Boolean(fieldErrors["buyer.name"])}
                aria-describedby={
                  fieldErrors["buyer.name"] ? "buyer-name-error" : undefined
                }
              />
              {fieldErrors["buyer.name"] ? (
                <p id="buyer-name-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors["buyer.name"]}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="buyer-email" className="mb-1 block text-sm font-medium">
                Email <span aria-hidden="true">*</span>
              </label>
              <input
                id="buyer-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className={fieldClasses}
                aria-invalid={Boolean(fieldErrors["buyer.email"])}
                aria-describedby={
                  fieldErrors["buyer.email"] ? "buyer-email-error" : undefined
                }
              />
              {fieldErrors["buyer.email"] ? (
                <p id="buyer-email-error" className="mt-1 text-xs text-red-600">
                  {fieldErrors["buyer.email"]}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="h-12 rounded-full bg-brand font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting"
            ? "Memproses pembayaran…"
            : "Bayar Sekarang (simulasi)"}
        </button>
        <Link
          href="/cart"
          className="text-center text-sm font-medium text-muted-foreground underline hover:text-foreground"
        >
          ← Kembali ke keranjang
        </Link>
      </div>

      <aside
        aria-label="Ringkasan pesanan"
        className="rounded-2xl border border-border bg-muted/60 p-5 lg:sticky lg:top-24"
      >
        <h2 className="text-lg font-bold">Ringkasan pesanan</h2>
        <ul className="mt-4 flex flex-col gap-3 text-sm">
          {totals.lines.map((line) => (
            <li
              key={`${line.productId}:${line.packageId}`}
              className="flex flex-wrap justify-between gap-2"
            >
              <span>
                {line.productName} · {line.packageName} × {line.quantity}
              </span>
              <span className="font-semibold">
                {formatPrice(line.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Jumlah lisensi</dt>
            <dd className="font-semibold">{formatNumber(totals.totalQuantity)}</dd>
          </div>
          <div className="flex justify-between text-base">
            <dt className="font-semibold">Total / bulan</dt>
            <dd className="font-bold text-brand">
              {formatPrice(totals.subtotal)}
            </dd>
          </div>
        </dl>
      </aside>
    </form>
  );
}
