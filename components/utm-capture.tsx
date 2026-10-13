"use client";

import { useEffect } from "react";
import { captureUtmFromLocation } from "@/lib/analytics/utm";

/**
 * Runs once per full page load: captures UTM params from the URL into
 * first-party storage so attribution survives navigation and refreshes.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtmFromLocation();
  }, []);
  return null;
}
