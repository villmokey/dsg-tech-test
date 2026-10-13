import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

// Computed once at module scope (build time) — stable for the deployment.
const currentYear = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-bold">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {siteConfig.tagline}. Situs kampanye {siteConfig.campaign.name}.
          </p>
        </div>
        <nav aria-label="Tautan footer" className="text-sm">
          <p className="font-semibold">Jelajahi</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <Link href="/products" className="hover:text-foreground">
                Katalog Produk
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-foreground">
                Keranjang
              </Link>
            </li>
          </ul>
        </nav>
        <div className="text-sm">
          <p className="font-semibold">Kontak</p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground">
            <li>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                TikTok
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {currentYear} {siteConfig.name}. Data pada situs demo ini
        adalah dummy.
      </div>
    </footer>
  );
}
