import imageUrlBuilder from "@sanity/image-url";
import { getReadClient } from "@/lib/content/sanity-client";
import type {
  Article,
  LandingContent,
  Product,
  ProductCategory,
} from "@/lib/types";

/**
 * Maps raw Sanity documents (GROQ projections) onto the shared domain types.
 * Keeping this in one place means the site never depends on raw CMS shapes.
 */

let builder: ReturnType<typeof imageUrlBuilder> | null = null;

function getBuilder() {
  if (!builder) {
    builder = imageUrlBuilder(getReadClient());
  }
  return builder;
}

export function sanityImage(
  image: SanityImageRef | undefined,
  fallbackAlt: string,
) {
  if (!image) return undefined;
  return {
    url: getBuilder().image(image).auto("format").width(1200).url(),
    alt: image.alt ?? fallbackAlt,
  };
}

export interface SanityImageRef {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  alt?: string;
}

/* -------------------------------- projections ------------------------------- */

const packageProjection = `{
  "id": id,
  "name": name,
  "monthlyPrice": monthlyPrice,
  "regularMonthlyPrice": regularMonthlyPrice,
  "highlights": highlights
}`;

const productProjection = `{
  "id": productId,
  slug,
  name,
  "category": category,
  tagline,
  description,
  features,
  "images": images[]{ "url": asset->url, alt },
  unit,
  "promoQuotaRemaining": promoQuotaRemaining,
  "promoQuotaTotal": promoQuotaTotal,
  badge,
  "packages": packages[]${packageProjection}
}`;

const articleProjection = `{
  title,
  slug,
  category,
  excerpt,
  "coverImage": { "url": coverImage.asset->url, "alt": coalesce(coverImage.alt, title) },
  body,
  publishedAt,
  published,
  "relatedProductIds": relatedProducts[]->productId
}`;

export const landingQuery = `*[_type == "landingPage"][0]{
  hero{ eyebrow, title, subtitle, "image": { "url": image.asset->url, "alt": coalesce(image.alt, title) }, ctaLabel, ctaHref },
  "featuredProductIds": featuredProducts[]->productId,
  "testimonials": testimonials[]{ quote, author, role, company },
  "faq": faq[]{ question, answer }
}`;

export const productsQuery = `*[_type == "product"] | order(name asc) ${productProjection}`;

export const publishedArticlesQuery = `*[_type == "article" && published == true] | order(publishedAt desc) ${articleProjection}`;

export const articleBySlugQuery = `*[_type == "article" && published == true && slug.current == $slug][0] ${articleProjection}`;

/* --------------------------------- mappers ---------------------------------- */
/* Every mapper normalizes CMS data into render-safe shapes. Sanity's schema
 * validation only runs in the Studio — API mutations and partial documents can
 * contain anything, and a crashing render pins the stale page in the ISR
 * cache. Missing optional fields degrade to empty render-safe values; only
 * structurally unusable documents (no slug, no packages) are dropped. */

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toProduct(doc: Record<string, unknown>): Product {
  const slug =
    typeof (doc.slug as { current?: string } | undefined)?.current === "string"
      ? (doc.slug as { current: string }).current
      : "";
  const images = ((doc.images as Product["images"]) ?? []).filter(
    (image): image is Product["images"][number] => Boolean(image?.url),
  );
  const packages = ((doc.packages as Product["packages"]) ?? []).map((pkg) => ({
    id: pkg.id,
    name: str(pkg.name, pkg.id),
    monthlyPrice: typeof pkg.monthlyPrice === "number" ? pkg.monthlyPrice : 0,
    regularMonthlyPrice:
      typeof pkg.regularMonthlyPrice === "number"
        ? pkg.regularMonthlyPrice
        : null,
    highlights: (pkg.highlights as string[]) ?? [],
  }));
  return {
    id: str(doc.id),
    slug,
    name: str(doc.name),
    category: (doc.category as ProductCategory) ?? "addons",
    tagline: str(doc.tagline),
    description: str(doc.description),
    features: (doc.features as string[]) ?? [],
    images,
    unit: doc.unit === "user" ? "user" : "outlet",
    promoQuotaRemaining:
      typeof doc.promoQuotaRemaining === "number" ? doc.promoQuotaRemaining : 0,
    promoQuotaTotal:
      typeof doc.promoQuotaTotal === "number" ? doc.promoQuotaTotal : 0,
    badge: (doc.badge as string | undefined) ?? undefined,
    packages,
  };
}

function toArticle(doc: Record<string, unknown>): Article {
  const slug =
    typeof (doc.slug as { current?: string } | undefined)?.current === "string"
      ? (doc.slug as { current: string }).current
      : "";
  const coverImage = doc.coverImage as Article["coverImage"] | null;
  return {
    title: typeof doc.title === "string" ? doc.title : "",
    slug,
    category: typeof doc.category === "string" ? doc.category : "",
    excerpt: typeof doc.excerpt === "string" ? doc.excerpt : "",
    // Missing covers degrade to "card without an image" downstream; they
    // must never crash a render or the ISR cache pins a stale page.
    coverImage: coverImage ?? { url: "", alt: "" },
    body: (doc.body as Article["body"]) ?? [],
    publishedAt:
      typeof doc.publishedAt === "string"
        ? doc.publishedAt
        : "1970-01-01T00:00:00.000Z",
    published: doc.published === true,
    relatedProductIds: (doc.relatedProductIds as string[]) ?? [],
  };
}

export function mapLanding(doc: Record<string, unknown> | null): LandingContent | null {
  if (!doc) return null;
  const hero = (doc.hero ?? {}) as Record<string, unknown>;
  const heroImage = hero.image as LandingContent["hero"]["image"] | null;
  const testimonials = ((doc.testimonials as LandingContent["testimonials"]) ?? [])
    .map((item) => ({
      quote: str(item.quote),
      author: str(item.author),
      role: str(item.role),
      company: str(item.company),
    }))
    .filter((item) => item.quote && item.author);
  const faq = ((doc.faq as LandingContent["faq"]) ?? [])
    .map((item) => ({
      question: str(item.question),
      answer: str(item.answer),
    }))
    .filter((item) => item.question && item.answer);
  return {
    hero: {
      eyebrow: str(hero.eyebrow),
      title: str(hero.title),
      subtitle: str(hero.subtitle),
      // A missing/assetless hero image falls back to the bundled placeholder.
      image:
        heroImage && typeof heroImage.url === "string" && heroImage.url
          ? heroImage
          : { url: "/images/hero.svg", alt: "Kodeva" },
      ctaLabel: str(hero.ctaLabel),
      ctaHref: str(hero.ctaHref, "/products"),
    },
    featuredProductIds: (doc.featuredProductIds as string[]) ?? [],
    testimonials,
    faq,
  };
}

export function mapProducts(docs: Record<string, unknown>[]): Product[] {
  // A product without a slug has no detail URL; without packages it has
  // nothing to sell — either would crash cards, selectors, or the pricing
  // engine downstream.
  return docs
    .map(toProduct)
    .filter((product) => Boolean(product.slug) && product.packages.length > 0);
}

/**
 * Only drops articles that are unusable (no slug → no URL). Articles missing
 * optional fields (cover, excerpt, …) are kept and rendered gracefully — one
 * incomplete CMS document must never crash a render, because a crashing
 * regeneration pins the stale page in the ISR cache indefinitely.
 */
export function mapArticles(docs: Record<string, unknown>[]): Article[] {
  return docs
    .map(toArticle)
    .filter((article) => Boolean(article.slug));
}
