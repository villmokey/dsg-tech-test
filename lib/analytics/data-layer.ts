import type { Product } from "@/lib/types";
import { getStoredUtm } from "@/lib/analytics/utm";
import { siteConfig } from "@/lib/site-config";

/**
 * GA4-style data layer. Events are pushed to window.dataLayer with ecommerce
 * payloads; no live GA account is required. In development each push is also
 * logged to the console so emission is observable; in production the same
 * events are inspectable via DevTools (`window.dataLayer`).
 */

export interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category: string;
  item_variant: string;
  price: number;
  quantity: number;
  currency: string;
  /** Remaining promo quota at the time of the event. */
  promotion_quota_remaining: number;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function toEcommerceItem(
  product: Product,
  packageId: Product["packages"][number]["id"],
  quantity: number,
): EcommerceItem {
  const pkg = product.packages.find((p) => p.id === packageId);
  return {
    item_id: product.id,
    item_name: product.name,
    item_category: product.category,
    item_variant: pkg?.name ?? packageId,
    price: pkg?.monthlyPrice ?? 0,
    quantity,
    currency: siteConfig.currency,
    promotion_quota_remaining: product.promoQuotaRemaining,
  };
}

function campaignParams(): Record<string, unknown> {
  const utm = getStoredUtm();
  if (!utm) return {};
  return {
    campaign_id: siteConfig.campaign.id,
    campaign_name: utm.utm_campaign ?? siteConfig.campaign.name,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
  };
}

/**
 * Push an event onto the data layer. Interaction events must be called from
 * inside their action handlers (never from render), and view events should be
 * guarded by the caller (see useTrackedViewItem) so re-renders cannot emit
 * duplicates.
 */
export function trackEvent(
  event: string,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...campaignParams(),
    ...params,
  });
  if (process.env.NODE_ENV !== "production") {
    // Observability without a GA account (see README verification section).
    console.info(`[dataLayer] ${event}`, {
      ...campaignParams(),
      ...params,
    });
  }
}

export function trackViewItem(item: EcommerceItem): void {
  trackEvent("view_item", {
    ecommerce: { currency: item.currency, value: item.price, items: [item] },
  });
}

export function trackAddToCart(item: EcommerceItem, value: number): void {
  trackEvent("add_to_cart", {
    ecommerce: { currency: item.currency, value, items: [item] },
  });
}

export function trackBeginCheckout(
  items: EcommerceItem[],
  value: number,
): void {
  trackEvent("begin_checkout", {
    ecommerce: {
      currency: siteConfig.currency,
      value,
      items,
    },
  });
}

/** Landing-page CTA clicks use a custom event name, documented in README. */
export function trackCtaClick(ctaLabel: string, ctaHref: string): void {
  trackEvent("cta_click", { cta_label: ctaLabel, cta_destination: ctaHref });
}
