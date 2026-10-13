import type { PortableTextBlock } from "@portabletext/react";

/* ---------------------------------- catalog --------------------------------- */

export type PackageId = "basic" | "pro" | "business";

export type ProductCategory = "pos" | "hr-payroll" | "addons";

export const productCategoryLabels: Record<ProductCategory, string> = {
  pos: "Point of Sale",
  "hr-payroll": "HR & Payroll",
  addons: "Add-on",
};

export interface PackageOption {
  id: PackageId;
  name: string;
  /** Current (promo) monthly price per license unit, in whole IDR. */
  monthlyPrice: number;
  /** Crossed-out regular monthly price; null when not discounted. */
  regularMonthlyPrice: number | null;
  highlights: string[];
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  tagline: string;
  description: string;
  features: string[];
  images: ProductImage[];
  /** What one license covers for this product ("user" or "outlet"). */
  unit: "user" | "outlet";
  /** Remaining promo license quota across all packages of this product. */
  promoQuotaRemaining: number;
  promoQuotaTotal: number;
  /** Exactly the three package options, ordered basic → pro → business. */
  packages: PackageOption[];
  badge?: string;
}

/* ----------------------------------- cart ----------------------------------- */

export interface CartLine {
  productId: string;
  packageId: PackageId;
  quantity: number;
}

export interface PricedCartLine extends CartLine {
  productName: string;
  packageName: string;
  unit: Product["unit"];
  unitPrice: number;
  regularUnitPrice: number | null;
  lineTotal: number;
}

export interface CartTotals {
  lines: PricedCartLine[];
  subtotal: number;
  totalQuantity: number;
}

/* ----------------------------------- blog ----------------------------------- */

export interface Article {
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  coverImage: ProductImage;
  body: PortableTextBlock[];
  publishedAt: string;
  /** Draft articles are never exposed on the public site. */
  published: boolean;
  relatedProductIds: string[];
}

export interface ArticlePage {
  articles: Article[];
  page: number;
  totalArticles: number;
  totalPages: number;
}

/* --------------------------------- landing ---------------------------------- */

export interface HeroContent {
  title: string;
  subtitle: string;
  eyebrow: string;
  image: ProductImage;
  ctaLabel: string;
  ctaHref: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface LandingContent {
  hero: HeroContent;
  featuredProductIds: string[];
  testimonials: Testimonial[];
  faq: FaqItem[];
}

/* ---------------------------------- leads ----------------------------------- */

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface StoredUtm extends UtmParams {
  /** ISO timestamp of the most recent campaign touch that wrote this entry. */
  capturedAt: string;
}

export interface LeadSubmission {
  name: string;
  email?: string;
  whatsapp?: string;
  utm: StoredUtm | null;
  landingPage: string;
  submittedAt: string;
}

/* ---------------------------------- orders ---------------------------------- */

export type PaymentStatus = "success" | "failed";

export interface MockOrderItem {
  productId: string;
  productName: string;
  packageId: PackageId;
  packageName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MockOrderPayload {
  orderId: string;
  buyer: { name: string; email: string };
  items: MockOrderItem[];
  subtotal: number;
  totalQuantity: number;
  utm: StoredUtm | null;
  paymentStatus: PaymentStatus;
  failureReason?: string;
  createdAt: string;
}
