import imageUrlBuilder from "@sanity/image-url";
import { sanityReadClient } from "@/lib/content/sanity-client";
import type {
  Article,
  LandingContent,
  Product,
  ProductCategory,
  PackageId,
} from "@/lib/types";

/**
 * Maps raw Sanity documents (GROQ projections) onto the shared domain types.
 * Keeping this in one place means the site never depends on raw CMS shapes.
 */

const builder = imageUrlBuilder(sanityReadClient);

export function sanityImage(
  image: SanityImageRef | undefined,
  fallbackAlt: string,
) {
  if (!image) return undefined;
  return {
    url: builder.image(image).auto("format").width(1200).url(),
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

function toProduct(doc: Record<string, unknown>): Product {
  return {
    id: doc.id as string,
    slug: (doc.slug as { current: string }).current,
    name: doc.name as string,
    category: doc.category as ProductCategory,
    tagline: doc.tagline as string,
    description: doc.description as string,
    features: (doc.features as string[]) ?? [],
    images: (doc.images as Product["images"]) ?? [],
    unit: doc.unit as Product["unit"],
    promoQuotaRemaining: (doc.promoQuotaRemaining as number) ?? 0,
    promoQuotaTotal: (doc.promoQuotaTotal as number) ?? 0,
    badge: (doc.badge as string | undefined) ?? undefined,
    packages: ((doc.packages as Product["packages"]) ?? []).map((pkg) => ({
      ...pkg,
      regularMonthlyPrice: pkg.regularMonthlyPrice ?? null,
    })),
  };
}

function toArticle(doc: Record<string, unknown>): Article {
  return {
    title: doc.title as string,
    slug: (doc.slug as { current: string }).current,
    category: doc.category as string,
    excerpt: doc.excerpt as string,
    coverImage: doc.coverImage as Article["coverImage"],
    body: (doc.body as Article["body"]) ?? [],
    publishedAt: doc.publishedAt as string,
    published: doc.published === true,
    relatedProductIds: (doc.relatedProductIds as string[]) ?? [],
  };
}

export function mapLanding(doc: Record<string, unknown> | null): LandingContent | null {
  if (!doc) return null;
  const hero = (doc.hero ?? {}) as Record<string, unknown>;
  const str = (value: unknown, fallback = ""): string =>
    typeof value === "string" ? value : fallback;
  return {
    hero: {
      eyebrow: str(hero.eyebrow),
      title: str(hero.title),
      subtitle: str(hero.subtitle),
      image: (hero.image as LandingContent["hero"]["image"]) ?? {
        url: "/images/hero.svg",
        alt: "Kodeva",
      },
      ctaLabel: str(hero.ctaLabel),
      ctaHref: str(hero.ctaHref, "/products"),
    },
    featuredProductIds: (doc.featuredProductIds as string[]) ?? [],
    testimonials: (doc.testimonials as LandingContent["testimonials"]) ?? [],
    faq: (doc.faq as LandingContent["faq"]) ?? [],
  };
}

export function mapProducts(docs: Record<string, unknown>[]): Product[] {
  return docs.map(toProduct);
}

export function mapArticles(docs: Record<string, unknown>[]): Article[] {
  return docs.map(toArticle);
}
