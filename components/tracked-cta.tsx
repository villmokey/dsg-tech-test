"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackCtaClick } from "@/lib/analytics/data-layer";

/**
 * Landing CTA that fires the custom `cta_click` dataLayer event inside the
 * click handler (once per actual click — never re-fired by re-renders).
 */
export function TrackedCta({
  href,
  label,
  children,
  className,
}: {
  href: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => trackCtaClick(label, href)}
    >
      {children}
    </Link>
  );
}
