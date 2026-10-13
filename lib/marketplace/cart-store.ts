"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  applyCartChange,
  type CartChangeResult,
} from "@/lib/marketplace/pricing";
import type { CartLine, PackageId, Product } from "@/lib/types";

/**
 * Cart state: zustand + localStorage persistence (survives refresh). Quota and
 * totals are NOT computed here — every mutation validates through
 * lib/marketplace/pricing.ts so cart, checkout, and UI can never disagree.
 */

export interface CartActionError {
  message: string;
  /** Epoch ms; lets the UI re-show the same message on repeated failures. */
  at: number;
}

interface CartState {
  lines: CartLine[];
  lastError: CartActionError | null;
  addItem: (
    product: Product,
    packageId: PackageId,
    quantity: number,
  ) => CartChangeResult;
  updateQuantity: (
    product: Product,
    packageId: PackageId,
    quantity: number,
  ) => CartChangeResult;
  removeItem: (productId: string, packageId: PackageId) => void;
  clearCart: () => void;
  dismissError: () => void;
}

function commit(
  set: (partial: Partial<CartState>) => void,
  lines: CartLine[],
): void {
  set({ lines, lastError: null });
}

function reject(
  set: (partial: Partial<CartState>) => void,
  result: Extract<CartChangeResult, { ok: false }>,
): Extract<CartChangeResult, { ok: false }> {
  set({ lastError: { message: result.error.message, at: Date.now() } });
  return result;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      lastError: null,

      addItem: (product, packageId, quantity) => {
        // Adding N licenses to a row that already exists targets the
        // combined row quantity; otherwise it is a brand-new row.
        const existing = get().lines.find(
          (line) =>
            line.productId === product.id && line.packageId === packageId,
        );
        const result = applyCartChange(get().lines, {
          product,
          packageId,
          quantity: (existing?.quantity ?? 0) + quantity,
        });
        if (!result.ok) return reject(set, result);
        commit(set, result.lines);
        return result;
      },

      updateQuantity: (product, packageId, quantity) => {
        const result = applyCartChange(get().lines, {
          product,
          packageId,
          quantity,
        });
        if (!result.ok) return reject(set, result);
        commit(set, result.lines);
        return result;
      },

      removeItem: (productId, packageId) => {
        commit(
          set,
          get().lines.filter(
            (line) =>
              !(line.productId === productId && line.packageId === packageId),
          ),
        );
      },

      clearCart: () => {
        commit(set, []);
      },

      dismissError: () => {
        set({ lastError: null });
      },
    }),
    {
      name: "kodeva-cart",
      version: 1,
    },
  ),
);

export function selectCartCount(state: CartState): number {
  return state.lines.reduce((sum, line) => sum + line.quantity, 0);
}
