"use client";

import { useEffect, useRef, useState } from "react";
import { getStoredUtm } from "@/lib/analytics/utm";
import { leadSchema } from "@/lib/validation";

type FormStatus = "idle" | "submitting" | "success" | "error";

const fieldClasses =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-brand";

/**
 * Lead capture form. Validation runs client-side (fast feedback) and is
 * re-enforced server-side in /api/leads. Spam protection: hidden honeypot
 * field + server-side minimum fill time.
 */
export function LeadForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const startedAt = useRef<number>(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      whatsapp: String(data.get("whatsapp") ?? ""),
      companyWebsite: String(data.get("companyWebsite") ?? ""),
      formStartedAt: startedAt.current,
      utm: getStoredUtm(),
      landingPage: typeof window !== "undefined" ? window.location.pathname : "/",
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setStatus("error");
      setMessage("Periksa kembali isian formulir.");
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    setMessage(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`status ${response.status}`);
      }
      setStatus("success");
      setMessage("Terima kasih! Tim kami akan menghubungi kamu.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(
        "Gagal mengirim. Coba lagi beberapa saat — data kamu belum tersimpan.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 rounded-2xl border border-border bg-background p-6"
      aria-labelledby="lead-form-heading"
    >
      <div>
        <h2 id="lead-form-heading" className="text-xl font-bold tracking-tight">
          Tertarik dengan promo ini?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tinggalkan kontak kami — tim Kodeva akan menghubungi kamu terkait
          kuota lisensi promo.
        </p>
      </div>

      {/* Honeypot: hidden from real users, irresistible to naive bots. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Company website</label>
        <input
          type="text"
          id="companyWebsite"
          name="companyWebsite"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="lead-name" className="mb-1 block text-sm font-medium">
          Nama <span aria-hidden="true">*</span>
        </label>
        <input
          id="lead-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={fieldClasses}
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "lead-name-error" : undefined}
        />
        {fieldErrors.name ? (
          <p id="lead-name-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          autoComplete="email"
          className={fieldClasses}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "lead-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="lead-email-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="lead-whatsapp" className="mb-1 block text-sm font-medium">
          Nomor WhatsApp
        </label>
        <input
          id="lead-whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="08xxxxxxxxxx"
          className={fieldClasses}
          aria-invalid={Boolean(fieldErrors.whatsapp)}
          aria-describedby={
            fieldErrors.whatsapp
              ? "lead-whatsapp-error"
              : "lead-whatsapp-hint"
          }
        />
        {fieldErrors.whatsapp ? (
          <p id="lead-whatsapp-error" className="mt-1 text-xs text-red-600">
            {fieldErrors.whatsapp}
          </p>
        ) : (
          <p id="lead-whatsapp-hint" className="mt-1 text-xs text-muted-foreground">
            Isi minimal salah satu: email atau nomor WhatsApp.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="h-12 rounded-full bg-brand font-semibold text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Mengirim…" : "Hubungi Saya"}
      </button>

      <p aria-live="polite" role="status">
        {message ? (
          <span
            className={
              status === "success"
                ? "text-sm font-medium text-emerald-600"
                : "text-sm font-medium text-red-600"
            }
          >
            {message}
          </span>
        ) : null}
      </p>
    </form>
  );
}
