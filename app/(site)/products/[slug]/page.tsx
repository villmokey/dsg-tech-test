import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageSelector } from "@/components/marketplace/package-selector";
import {
  getProducts,
  getProductBySlug,
} from "@/lib/content";
import { productCategoryLabels } from "@/lib/types";
import { siteConfig } from "@/lib/site-config";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {};
  }
  return {
    title: product.name,
    description: product.tagline,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title: `${product.name} — ${product.tagline}`,
      description: product.description,
      url: `/products/${product.slug}`,
      images: product.images[0]
        ? [{ url: product.images[0].url, alt: product.images[0].alt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.tagline,
      images: product.images[0] ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((image) => image.url),
    brand: { "@type": "Brand", name: siteConfig.name },
    category: productCategoryLabels[product.category],
    offers: product.packages.map((pkg) => ({
      "@type": "Offer",
      name: pkg.name,
      price: pkg.monthlyPrice,
      priceCurrency: siteConfig.currency,
      availability:
        product.promoQuotaRemaining > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
    })),
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          ← Katalog produk
        </Link>
      </nav>

      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <section aria-label="Tampilan produk" className="flex flex-col gap-4">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-2 gap-4">
              {product.images.slice(1).map((image) => (
                <div
                  key={image.url}
                  className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-muted"
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-brand">
              {productCategoryLabels[product.category]}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {product.tagline}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <ul className="flex flex-col gap-2">
            {product.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span aria-hidden="true" className="mt-0.5 text-emerald-600">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <PackageSelector product={product} />
        </section>
      </div>
    </main>
  );
}
