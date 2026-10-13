import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata, Viewport } from "next";
import { StudioClient } from "@/components/studio/studio-client";

export const metadata: Metadata = {
  title: "Kodeva CMS",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

/**
 * The Studio is an admin tool, not public content. The embedded Studio shell
 * cannot be prerendered, so this route renders at request time: the async
 * loader below awaits `connection()` inside a Suspense boundary — the Next 16
 * replacement for `dynamic = 'force-dynamic'` under Cache Components. The
 * prerendered shell shows the fallback; the Studio streams in per request.
 */
async function StudioLoader() {
  await connection();
  return <StudioClient />;
}

export default function StudioPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm">Memuat Studio…</p>}>
      <StudioLoader />
    </Suspense>
  );
}
