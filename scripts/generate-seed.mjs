// Generates seed/seed.ndjson from lib/content/fixtures.ts so the CMS demo
// starts with the same content the site shows in fixture mode.
// Run with: node scripts/generate-seed.mjs
// Import with: pnpm dlx sanity@latest datasets import seed/seed.ndjson production --replace
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fixtures } from "../lib/content/fixtures.ts";

const ABS_PUBLIC = path.resolve(process.cwd(), "public");
let keyCounter = 0;
const key = () => `k${keyCounter++}`;

function assetRef(localUrl) {
  // "/images/products/x.svg" → absolute file URI for sanity dataset import.
  return `image@file://${path.join(ABS_PUBLIC, localUrl)}`;
}

const lines = [];

/* products */
for (const product of fixtures.products) {
  lines.push({
    _id: `product-${product.id}`,
    _type: "product",
    productId: product.id,
    slug: { _type: "slug", current: product.slug },
    name: product.name,
    category: product.category,
    unit: product.unit,
    tagline: product.tagline,
    description: product.description,
    features: product.features,
    images: product.images.map((image) => ({
      _type: "image",
      _key: key(),
      alt: image.alt,
      _sanityAsset: assetRef(image.url),
    })),
    promoQuotaRemaining: product.promoQuotaRemaining,
    promoQuotaTotal: product.promoQuotaTotal,
    ...(product.badge ? { badge: product.badge } : {}),
    packages: product.packages.map((pkg) => ({
      _key: key(),
      id: pkg.id,
      name: pkg.name,
      monthlyPrice: pkg.monthlyPrice,
      regularMonthlyPrice: pkg.regularMonthlyPrice ?? null,
      highlights: pkg.highlights,
    })),
  });
}

/* landing page singleton */
lines.push({
  _id: "landingPage",
  _type: "landingPage",
  hero: {
    eyebrow: fixtures.landingContent.hero.eyebrow,
    title: fixtures.landingContent.hero.title,
    subtitle: fixtures.landingContent.hero.subtitle,
    image: {
      _type: "image",
      alt: fixtures.landingContent.hero.image.alt,
      _sanityAsset: assetRef(fixtures.landingContent.hero.image.url),
    },
    ctaLabel: fixtures.landingContent.hero.ctaLabel,
    ctaHref: fixtures.landingContent.hero.ctaHref,
  },
  featuredProducts: fixtures.landingContent.featuredProductIds.map((id) => ({
    _key: key(),
    _type: "reference",
    _ref: `product-${id}`,
  })),
  testimonials: fixtures.landingContent.testimonials,
  faq: fixtures.landingContent.faq,
});

/* articles */
for (const article of fixtures.articles) {
  lines.push({
    _id: `article-${article.slug}`,
    _type: "article",
    title: article.title,
    slug: { _type: "slug", current: article.slug },
    category: article.category,
    excerpt: article.excerpt,
    coverImage: {
      _type: "image",
      alt: article.coverImage.alt,
      _sanityAsset: assetRef(article.coverImage.url),
    },
    body: article.body,
    publishedAt: article.publishedAt,
    published: article.published,
    relatedProducts: article.relatedProductIds.map((id) => ({
      _key: key(),
      _type: "reference",
      _ref: `product-${id}`,
    })),
  });
}

mkdirSync("seed", { recursive: true });
writeFileSync(
  "seed/seed.ndjson",
  lines.map((line) => JSON.stringify(line)).join("\n") + "\n",
  "utf-8",
);
console.log(`Wrote ${lines.length} documents to seed/seed.ndjson`);
