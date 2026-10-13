import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isSanityConfigured,
  getWriteClient,
} from "@/lib/content/sanity-client";
import type { LeadSubmission } from "@/lib/types";

/**
 * Lead persistence.
 *
 * - With Sanity configured: leads are stored as `lead` documents and are
 *   viewable by marketing in the Studio at /studio.
 * - Without Sanity (local dev / fixture mode): leads append to
 *   `.data/leads.json`. This is file-based and works locally; on serverless
 *   hosting the filesystem is ephemeral, so production demos should configure
 *   Sanity (documented in README).
 */

const LOCAL_LEADS_DIR = path.join(process.cwd(), ".data");
const LOCAL_LEADS_FILE = path.join(LOCAL_LEADS_DIR, "leads.json");

async function saveLeadLocally(lead: LeadSubmission): Promise<void> {
  await mkdir(LOCAL_LEADS_DIR, { recursive: true });
  let existing: LeadSubmission[] = [];
  try {
    existing = JSON.parse(await readFile(LOCAL_LEADS_FILE, "utf-8")) as
      LeadSubmission[];
  } catch {
    existing = [];
  }
  existing.push(lead);
  await writeFile(LOCAL_LEADS_FILE, JSON.stringify(existing, null, 2), "utf-8");
}

async function saveLeadToSanity(lead: LeadSubmission): Promise<void> {
  const client = getWriteClient();
  await client.create({
    _type: "lead",
    name: lead.name,
    ...(lead.email ? { email: lead.email } : {}),
    ...(lead.whatsapp ? { whatsapp: lead.whatsapp } : {}),
    utm: lead.utm
      ? {
          _type: "utmAttribution",
          utm_source: lead.utm.utm_source,
          utm_medium: lead.utm.utm_medium,
          utm_campaign: lead.utm.utm_campaign,
          utm_term: lead.utm.utm_term,
          utm_content: lead.utm.utm_content,
          capturedAt: lead.utm.capturedAt,
        }
      : undefined,
    landingPage: lead.landingPage,
    submittedAt: lead.submittedAt,
  });
}

export async function saveLead(lead: LeadSubmission): Promise<void> {
  if (isSanityConfigured) {
    await saveLeadToSanity(lead);
    return;
  }
  await saveLeadLocally(lead);
}

export async function listLocalLeads(): Promise<LeadSubmission[]> {
  try {
    return JSON.parse(await readFile(LOCAL_LEADS_FILE, "utf-8")) as
      LeadSubmission[];
  } catch {
    return [];
  }
}
