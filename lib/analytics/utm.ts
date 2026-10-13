"use client";

import type { StoredUtm, UtmParams } from "@/lib/types";

/**
 * UTM persistence: first-party localStorage.
 *
 * Policy (documented in README):
 * - Captured from the landing URL whenever any utm_* parameter is present.
 * - LAST-TOUCH overwrite: a new campaign URL replaces the stored entry.
 * - Lifetime: 30 days from the last capture, refreshed on each capture.
 * - All five standard params are captured; absent ones stay undefined.
 */

const STORAGE_KEY = "kodeva_utm";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export function captureUtmFromLocation(): StoredUtm | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const utm: Partial<UtmParams> = {};
  let found = false;
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) {
      utm[key] = value.slice(0, 120);
      found = true;
    }
  }
  if (!found) return getStoredUtm();
  const stored: StoredUtm = { ...utm, capturedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Private-mode browsers can block storage; attribution is best-effort.
  }
  return stored;
}

export function getStoredUtm(): StoredUtm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredUtm;
    if (Date.now() - new Date(parsed.capturedAt).getTime() > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
