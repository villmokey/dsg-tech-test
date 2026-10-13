"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

/**
 * Renders the embedded Studio, or setup instructions when Sanity env vars
 * are not configured (so /studio degrades gracefully in fixture mode).
 */
export function StudioClient() {
  if (!config.projectId) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold">Studio belum dikonfigurasi</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          CMS ini butuh env Sanity. Salin <code>.env.example</code> ke{" "}
          <code>.env.local</code>, isi{" "}
          <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (dan token), lalu import
          data demo:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-muted p-4 text-xs">
          {`pnpm dlx sanity@latest datasets import \\
  seed/seed.ndjson production --replace`}
        </pre>
        <p className="mt-4 text-sm text-muted-foreground">
          Langkah lengkap ada di README bagian &ldquo;CMS setup&rdquo;.
        </p>
      </div>
    );
  }
  return <NextStudio config={config} />;
}
