import type { FaqItem } from "@/lib/types";

export function Faq({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;
  return (
    <section id="faq" aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
      <h2 id="faq-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
        Pertanyaan Umum
      </h2>
      <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-background">
        {items.map((item) => (
          <details key={item.question} className="group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
