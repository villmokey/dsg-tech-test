export const siteConfig = {
  name: "Kodeva",
  tagline: "Software bisnis untuk UMKM yang mau naik kelas",
  description:
    "Kodeva membantu bisnis kecil dan menengah dengan software POS, HR, dan payroll berbasis langganan. Promo Akhir Tahun: kuota lisensi terbatas.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "id-ID",
  currency: "IDR",
  timezone: "Asia/Jakarta",
  campaign: {
    id: "promo-akhir-tahun-2026",
    name: "Promo Akhir Tahun",
  },
  social: {
    instagram: "https://instagram.com/kodeva.example",
    tiktok: "https://tiktok.com/@kodeva.example",
  },
} as const;

export const blogPageSize = 4;

/**
 * Localization note (README documents this): copy lives in the CMS and code is
 * locale-agnostic; currency/locale formatting flows through `siteConfig`, so
 * adding an id-MY or id-SG variant later is a config change, not a rewrite.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale, {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat(siteConfig.locale).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(iso));
}
