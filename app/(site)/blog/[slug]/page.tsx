import { PortableText } from "@portabletext/react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/article-card";
import { formatDate, formatPrice, siteConfig } from "@/lib/site-config";
import {
  getArticleBySlug,
  getProducts,
  getPublishedArticleSlugs,
  getPublishedArticles,
} from "@/lib/content";

export async function generateStaticParams() {
  const slugs = await getPublishedArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return {};
  }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `/blog/${article.slug}`,
      publishedTime: article.publishedAt,
      images: [{ url: article.coverImage.url, alt: article.coverImage.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage.url],
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  // Draft articles are filtered out at the content layer — unknown or draft
  // slugs 404 for public visitors.
  if (!article) {
    notFound();
  }

  const products = await getProducts();
  const relatedProducts = article.relatedProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> =>
      Boolean(product),
    );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage.url,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${article.slug}`,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link href="/blog" className="hover:text-foreground">
          ← Semua artikel
        </Link>
      </nav>
      <article>
        <header className="mt-6">
          <p className="text-xs font-semibold text-brand">
            {article.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <time
            dateTime={article.publishedAt}
            className="mt-3 block text-sm text-muted-foreground"
          >
            {formatDate(article.publishedAt)}
          </time>
        </header>
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-muted">
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            priority
            sizes="(min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
        <div className="article-prose mt-8">
          <PortableText value={article.body} />
        </div>
      </article>

      {relatedProducts.length > 0 ? (
        <section
          aria-labelledby="related-products-heading"
          className="mt-14 border-t border-border pt-10"
        >
          <h2 id="related-products-heading" className="text-xl font-bold tracking-tight">
            Produk terkait di artikel ini
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {relatedProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/products/${product.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border p-4 transition-colors hover:bg-muted"
                >
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold group-hover:text-brand">
                      {product.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {product.tagline}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-brand">
                    {formatPrice(product.packages[0].monthlyPrice)}
                    <span className="text-xs text-muted-foreground">
                      {" "}
                      /{product.unit}/bln
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="more-articles-heading" className="mt-14 border-t border-border pt-10">
        <h2 id="more-articles-heading" className="text-xl font-bold tracking-tight">
          Baca juga
        </h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
          {(await getPublishedArticles())
            .filter((item) => item.slug !== article.slug)
            .slice(0, 2)
            .map((item) => (
              <li key={item.slug}>
                <ArticleCard article={item} />
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
