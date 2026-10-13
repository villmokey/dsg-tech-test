import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            K
          </span>
          {siteConfig.name}
        </Link>
        <nav aria-label="Navigasi utama" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/products"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Produk
          </Link>
          <Link
            href="/blog"
            className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Blog
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
