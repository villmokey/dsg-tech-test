import { z } from "zod";

/**
 * Shared validation for client forms and server route handlers. One source of
 * truth so client-side UX and server-side enforcement can never drift.
 *
 * Lead contact interpretation (documented in README): either email OR WhatsApp
 * is required — at least one, both allowed.
 */

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(80, "Nama maksimal 80 karakter");

export const emailSchema = z
  .string()
  .trim()
  .email("Format email tidak valid")
  .max(120);

export const whatsappSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{7,16}$/, "Nomor WhatsApp tidak valid")
  .refine((value) => value.replace(/\D/g, "").length >= 8, {
    message: "Nomor WhatsApp minimal 8 digit",
  });

export const leadSchema = z
  .object({
    name: nameSchema,
    email: z.union([emailSchema, z.literal("")]).optional(),
    whatsapp: z.union([whatsappSchema, z.literal("")]).optional(),
    // Spam protection: a hidden field real users never fill, and the epoch ms
    // timestamp rendered into the form so the server can reject instant bots.
    companyWebsite: z.literal("").optional(),
    formStartedAt: z.number().int().positive(),
  })
  .refine(
    (data) =>
      Boolean((data.email && data.email.length > 0) || (data.whatsapp && data.whatsapp.length > 0)),
    {
      message: "Isi email atau nomor WhatsApp",
      path: ["email"],
    },
  );

export type LeadInput = z.infer<typeof leadSchema>;

export const packageIdSchema = z.enum(["basic", "pro", "business"]);

export const orderSchema = z.object({
  buyer: z.object({
    name: nameSchema,
    email: emailSchema,
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        packageId: packageIdSchema,
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1, "Keranjang kosong"),
  // Marketing attribution, captured client-side from first-party storage.
  utm: z
    .object({
      utm_source: z.string().max(120).optional(),
      utm_medium: z.string().max(120).optional(),
      utm_campaign: z.string().max(120).optional(),
      utm_term: z.string().max(120).optional(),
      utm_content: z.string().max(120).optional(),
      capturedAt: z.string().max(40).optional(),
    })
    .nullable()
    .optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

/** Deterministic mock-payment rule: emails containing "+fail" simulate failure. */
export function simulatePaymentOutcome(email: string): {
  status: "success" | "failed";
  failureReason?: string;
} {
  if (email.toLowerCase().includes("+fail")) {
    return {
      status: "failed",
      failureReason:
        "Pembayaran ditolak oleh penyedia (simulasi kegagalan). Coba lagi atau gunakan email lain.",
    };
  }
  return { status: "success" };
}

/** Minimum milliseconds between form render and submission (spam time trap). */
export const MIN_FORM_FILL_MS = 2000;
