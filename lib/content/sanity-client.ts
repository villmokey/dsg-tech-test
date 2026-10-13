import { createClient } from "next-sanity";
import type { SanityClient } from "next-sanity";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-01-01",
};

/** True when CMS env vars are present; otherwise the content layer falls back to fixtures. */
export const isSanityConfigured = Boolean(sanityConfig.projectId);

/**
 * Clients are created lazily: createClient throws when projectId is empty, so
 * fixture-mode (no env vars) must never construct one at module scope.
 */
let readClient: SanityClient | null = null;

export function getReadClient(): SanityClient {
  if (!readClient) {
    readClient = createClient({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
      apiVersion: sanityConfig.apiVersion,
      useCdn: true,
    });
  }
  return readClient;
}

/** Server-only write client for lead submissions. Never import from client components. */
export function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN is not set; cannot write leads to the CMS.",
    );
  }
  return createClient({
    projectId: sanityConfig.projectId,
    dataset: sanityConfig.dataset,
    apiVersion: sanityConfig.apiVersion,
    useCdn: false,
    token,
  });
}

export const IMAGE_CDN_HOST = "cdn.sanity.io";
