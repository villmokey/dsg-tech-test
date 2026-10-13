import type { Testimonial } from "@/lib/types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <h2 id="testimonials-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
        Kata pelanggan kami
      </h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={`${item.author}-${item.company}`}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
          >
            <blockquote className="text-sm leading-relaxed text-foreground">
              “{item.quote}”
            </blockquote>
            <footer className="mt-auto flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand"
              >
                {item.author.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.author}</p>
                <p className="text-xs text-muted-foreground">
                  {item.role}, {item.company}
                </p>
              </div>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}
