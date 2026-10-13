import type { Metadata } from "next";
import { Faq } from "@/components/landing/faq";
import { Hero } from "@/components/landing/hero";
import { LeadForm } from "@/components/landing/lead-form";
import { Testimonials } from "@/components/landing/testimonials";
import { ProductCard } from "@/components/marketplace/product-card";
import {
  getFeaturedProducts,
  getLandingContent,
} from "@/lib/content";
import { siteConfig } from "@/lib/site-config";

// Computed once at module scope (build time) — stable for the deployment.
const currentYear = new Date().getFullYear();

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const [landing, featured] = await Promise.all([
    getLandingContent(),
    getFeaturedProducts(),
  ]);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landing.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero hero={landing.hero} />

      <section
        aria-labelledby="featured-heading"
        className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Produk unggulan promo
            </h2>
            <p className="mt-2 text-muted-foreground">
              Kuota lisensi promo terbatas per produk — dihitung dari total
              lisensi di keranjang, apa pun paketnya.
            </p>
          </div>
        </div>
        {featured.length > 0 ? (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-xl border border-border bg-muted p-6 text-sm text-muted-foreground">
            Belum ada produk unggulan. Cek katalog lengkap kami.
          </p>
        )}
      </section>

      <Testimonials items={landing.testimonials} />

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <div className="grid items-start gap-8 rounded-3xl border border-border bg-muted/60 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Siap naik kelas di {currentYear}?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tim kami bantu pilih paket yang pas dengan skala bisnismu — mulai
              dari 1 outlet sampai multi-cabang. Konsultasi gratis, tanpa
              komitmen.
            </p>
          </div>
          <LeadForm />
        </div>
      </section>

      <Faq items={landing.faq} />
    </main>
  );
}
