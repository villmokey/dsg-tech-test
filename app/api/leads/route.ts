import {
  leadSchema,
  MIN_FORM_FILL_MS,
} from "@/lib/validation";
import { saveLead } from "@/lib/leads";
import type { LeadSubmission } from "@/lib/types";

/**
 * POST /api/leads — validate, spam-check, persist.
 *
 * Spam protection:
 * 1. Honeypot: `companyWebsite` must be empty for real users. Bot hits get a
 *    fake-success response so the bot learns nothing, and nothing is stored.
 * 2. Time trap: submissions faster than MIN_FORM_FILL_MS after render are
 *    dropped the same way.
 *
 * Validation is re-run server-side; the client copy is UX only.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { ok: false, error: "Body bukan JSON yang valid." },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: "Data tidak valid.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const { companyWebsite, formStartedAt, utm, landingPage, ...contact } =
    parsed.data;

  const honeypotFilled = (companyWebsite ?? "").trim().length > 0;
  const filledTooFast =
    Number.isFinite(formStartedAt) &&
    Date.now() - formStartedAt < MIN_FORM_FILL_MS;

  if (honeypotFilled || filledTooFast) {
    return Response.json({ ok: true, stored: false });
  }

  const submission: LeadSubmission = {
    name: contact.name,
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.whatsapp ? { whatsapp: contact.whatsapp } : {}),
    utm: utm
      ? { ...utm, capturedAt: utm.capturedAt ?? new Date().toISOString() }
      : null,
    landingPage: landingPage ?? "/",
    submittedAt: new Date().toISOString(),
  };

  try {
    await saveLead(submission);
  } catch (error) {
    console.error("[api/leads] failed to persist lead", error);
    return Response.json(
      { ok: false, error: "Gagal menyimpan data. Coba lagi nanti." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, stored: true });
}
