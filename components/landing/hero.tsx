import Image from "next/image";
import { TrackedCta } from "@/components/tracked-cta";
import type { HeroContent } from "@/lib/types";

export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-brand-soft to-background">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="flex flex-col items-start gap-5">
          <p className="rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
            {hero.eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {hero.title}
          </h1>
          <p className="text-lg text-muted-foreground">{hero.subtitle}</p>
          <TrackedCta
            href={hero.ctaHref}
            label={hero.ctaLabel}
            className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-strong"
          >
            {hero.ctaLabel} →
          </TrackedCta>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          <Image
            src={hero.image.url}
            alt={hero.image.alt}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
