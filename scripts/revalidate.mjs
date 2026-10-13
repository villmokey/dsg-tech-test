// Triggers on-demand revalidation of the content cache against a running
// server — the local equivalent of the Sanity publish webhook.
// Usage: pnpm revalidate [baseUrl]
// Reads SANITY_REVALIDATE_SECRET and NEXT_PUBLIC_SITE_URL from .env.local.
import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const raw = readFileSync(".env.local", "utf-8");
    for (const line of raw.split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !(match[1] in process.env)) {
        process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env.local is optional; CLI args and real env still work.
  }
}

loadEnvLocal();

const base = process.argv[2] ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const secret = process.env.SANITY_REVALIDATE_SECRET;

if (!secret) {
  console.error(
    "SANITY_REVALIDATE_SECRET is not set (checked environment and .env.local).\n" +
      "The /api/revalidate route rejects unauthenticated calls, so there is no\n" +
      "secret it would accept — set the variable first (see .env.example).",
  );
  process.exit(1);
}

const response = await fetch(`${base}/api/revalidate`, {
  method: "POST",
  headers: { "x-webhook-secret": secret },
});

const body = await response.json().catch(() => ({}));

if (response.ok) {
  console.log(`Revalidated "${body.tag ?? "content"}" on ${base} — refresh the page.`);
} else {
  console.error(`Failed (${response.status}):`, JSON.stringify(body));
  process.exit(1);
}
