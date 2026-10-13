"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/marketplace/product-card";
import {
  productCategoryLabels,
  type Product,
  type ProductCategory,
} from "@/lib/types";

type Filter = "all" | ProductCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "pos", label: productCategoryLabels.pos },
  { id: "hr-payroll", label: productCategoryLabels["hr-payroll"] },
  { id: "addons", label: productCategoryLabels.addons },
];

export function Catalog({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((product) => product.category === filter),
    [products, filter],
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Filter kategori"
        className="flex flex-wrap gap-2"
      >
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
              filter === option.id
                ? "border-brand bg-brand text-white"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-border bg-muted p-6 text-sm text-muted-foreground">
          Tidak ada produk pada kategori ini.
        </p>
      )}
    </div>
  );
}
