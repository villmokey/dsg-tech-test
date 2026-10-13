import { cacheLife, cacheTag } from "next/cache";
import {
  isSanityConfigured,
  getReadClient,
} from "@/lib/content/sanity-client";
import {
  articleBySlugQuery,
  landingQuery,
  mapArticles,
  mapLanding,
  mapProducts,
  productsQuery,
  publishedArticlesQuery,
} from "@/lib/content/sanity-map";
import { articles, landingContent, products } from "@/lib/content/fixtures";
import { blogPageSize } from "@/lib/site-config";
import type { Article, ArticlePage, LandingContent, Product } from "@/lib/types";

/**
 * Content layer: every read the site makes goes through these functions.
 *
 * - When Sanity env vars are configured, content is fetched from the CMS.
 * - Otherwise it falls back to the typed fixtures in lib/content/fixtures.ts,
 *   so the site runs with zero external accounts (useful for local dev and
 *   first-clone review).
 * - All functions are cached with `use cache` and tagged `content`. Publishing
 *   in Sanity fires a webhook that calls revalidateTag("content"), so published
 *   changes appear without a redeploy. If Sanity is unreachable at render time
 *   the fixtures are served instead of a 500 (documented resilience trade-off).
 */

const CONTENT_TAG = "content";

async function fetchLanding(): Promise<LandingContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  if (isSanityConfigured) {
    try {
      const doc = await getReadClient().fetch(landingQuery);
      const mapped = mapLanding(doc);
      if (mapped) return mapped;
    } catch {
      // fall through to fixtures on CMS outage
    }
  }
  return landingContent;
}

async function fetchProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient().fetch(productsQuery);
      const mapped = mapProducts(docs);
      if (mapped.length > 0) return mapped;
    } catch {
      // fall through to fixtures on CMS outage
    }
  }
  return products;
}

async function fetchPublishedArticles(): Promise<Article[]> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  if (isSanityConfigured) {
    try {
      const docs = await getReadClient().fetch(publishedArticlesQuery);
      const mapped = mapArticles(docs);
      if (mapped.length > 0) return mapped;
    } catch {
      // fall through to fixtures on CMS outage
    }
  }
  return articles.filter((article) => article.published);
}

async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");
  if (isSanityConfigured) {
    try {
      const doc = await getReadClient().fetch(articleBySlugQuery, { slug });
      if (doc) return mapArticles([doc])[0];
    } catch {
      // fall through to fixtures on CMS outage
    }
  }
  return (
    articles.find(
      (article) => article.slug === slug && article.published,
    ) ?? null
  );
}

/* ----------------------------- public interface ----------------------------- */

export async function getLandingContent(): Promise<LandingContent> {
  return fetchLanding();
}

export async function getProducts(): Promise<Product[]> {
  return fetchProducts();
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await fetchProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const [all, landing] = await Promise.all([
    fetchProducts(),
    fetchLanding(),
  ]);
  return landing.featuredProductIds
    .map((id) => all.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));
}

export async function getPublishedArticles(): Promise<Article[]> {
  return fetchPublishedArticles();
}

export async function getArticlePage(page: number): Promise<ArticlePage> {
  const all = await fetchPublishedArticles();
  const totalArticles = all.length;
  const totalPages = Math.max(1, Math.ceil(totalArticles / blogPageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * blogPageSize;
  return {
    articles: all.slice(start, start + blogPageSize),
    page: safePage,
    totalArticles,
    totalPages,
  };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return fetchArticleBySlug(slug);
}

export async function getPublishedArticleSlugs(): Promise<string[]> {
  const all = await fetchPublishedArticles();
  return all.map((article) => article.slug);
}

export { CONTENT_TAG };
