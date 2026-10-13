"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { selectCartCount, useCartStore } from "@/lib/marketplace/cart-store";

const noopSubscribe = () => () => {};
const getMounted = () => true;
const getServerSnapshot = () => false;

/**
 * Cart access from every page. The badge intentionally renders 0 on the
 * server and until after mount — localStorage rehydration happens on the
 * client only, so this avoids a hydration mismatch flash.
 */
export function CartLink() {
  const count = useCartStore(selectCartCount);
  const mounted = useSyncExternalStore(
    noopSubscribe,
    getMounted,
    getServerSnapshot,
  );

  return (
    <Link
      href="/cart"
      aria-label={`Keranjang${mounted && count > 0 ? `, ${count} lisensi` : ""}`}
      className="relative inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition-colors hover:bg-muted"
    >
      <span aria-hidden="true">🛒</span>
      <span className="hidden sm:inline">Keranjang</span>
      {mounted && count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
