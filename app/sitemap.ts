import type { MetadataRoute } from "next";
import {
  getProducts,
  getPublishedArticles,
  getPublishedArticleSlugs,
} from "@/lib/content";
import { blogPageSize, siteConfig } from "@/lib/site-config";

/**
 * Sitemap covers landing, blog index + pagination, products, and published
 * articles. Draft articles are excluded (published-only queries). Generated
 * at build time; a deploy picks up new CMS content (documented in README).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  const [productSlugs, articleSlugs, articles] = await Promise.all([
    getProducts().then((all) => all.map((p) => p.slug)),
    getPublishedArticleSlugs(),
    getPublishedArticles(),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(articles.length / blogPageSize),
  );

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...Array.from({ length: totalPages - 1 }, (_, index) => ({
      url: `${base}/blog/page/${index + 2}`,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...productSlugs.map((slug) => ({
      url: `${base}/products/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...articleSlugs.map((slug) => {
      const article = articles.find((a) => a.slug === slug);
      return {
        url: `${base}/blog/${slug}`,
        lastModified: article ? new Date(article.publishedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    }),
  ];

  return entries;
}
