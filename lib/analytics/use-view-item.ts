"use client";

import { useEffect, useRef } from "react";
import { toEcommerceItem, trackViewItem } from "@/lib/analytics/data-layer";
import type { PackageId, Product } from "@/lib/types";

/**
 * Fires view_item once per product/package combination — the ref guard
 * prevents duplicate emission from component re-renders (e.g. React strict
 * mode double-effects).
 */
export function useViewItem(product: Product, packageId: PackageId): void {
  const firedKey = useRef<string | null>(null);
  useEffect(() => {
    const key = `${product.id}:${packageId}`;
    if (firedKey.current === key) return;
    firedKey.current = key;
    trackViewItem(toEcommerceItem(product, packageId, 1));
  }, [product, packageId]);
}
