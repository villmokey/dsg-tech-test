import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/site-config";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const cheapest = product.packages[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        {product.images[0] ? (
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        {product.badge ? (
          <span className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-black">
            {product.badge}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold group-hover:text-brand">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground">{product.tagline}</p>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-sm font-semibold text-brand">
            {formatPrice(cheapest.monthlyPrice)}
          </span>
          {cheapest.regularMonthlyPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(cheapest.regularMonthlyPrice)}
            </span>
          ) : null}
          <span className="text-xs text-muted-foreground">
            /{product.unit}/bln
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Sisa kuota promo: {product.promoQuotaRemaining} {product.unit}
        </p>
      </div>
    </Link>
  );
}
