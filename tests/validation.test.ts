import { describe, expect, it } from "vitest";
import {
  leadSchema,
  orderSchema,
  simulatePaymentOutcome,
} from "@/lib/validation";

const validLead = {
  name: "Rina Pratiwi",
  email: "rina@example.com",
  whatsapp: "",
  formStartedAt: Date.now() - 5000,
};

describe("leadSchema", () => {
  it("accepts a lead with email only", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("accepts a lead with whatsapp only", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      email: "",
      whatsapp: "081234567890",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a lead with both email and whatsapp", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      whatsapp: "+628123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a lead with neither contact method", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      email: "",
      whatsapp: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a whatsapp number with too few digits", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      email: "",
      whatsapp: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = leadSchema.safeParse({ ...validLead, name: "R" });
    expect(result.success).toBe(false);
  });

  it("accepts utm attribution and landing page", () => {
    const result = leadSchema.safeParse({
      ...validLead,
      utm: {
        utm_source: "instagram",
        utm_medium: "social",
        utm_campaign: "promo-akhir-tahun",
        capturedAt: new Date().toISOString(),
      },
      landingPage: "/",
    });
    expect(result.success).toBe(true);
  });
});

describe("orderSchema", () => {
  const validOrder = {
    buyer: { name: "Bayu Setiawan", email: "bayu@example.com" },
    items: [{ productId: "pos", packageId: "basic", quantity: 3 }],
  };

  it("accepts a valid order", () => {
    expect(orderSchema.safeParse(validOrder).success).toBe(true);
  });

  it("rejects an empty item list", () => {
    const result = orderSchema.safeParse({ ...validOrder, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive quantity", () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [{ productId: "pos", packageId: "basic", quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown package id", () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      items: [{ productId: "pos", packageId: "mega", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid buyer email", () => {
    const result = orderSchema.safeParse({
      ...validOrder,
      buyer: { name: "Bayu Setiawan", email: "nope" },
    });
    expect(result.success).toBe(false);
  });
});

describe("simulatePaymentOutcome", () => {
  it("succeeds for normal emails", () => {
    expect(simulatePaymentOutcome("buyer@example.com").status).toBe("success");
  });

  it("fails deterministically for emails containing +fail", () => {
    const result = simulatePaymentOutcome("buyer+fail@example.com");
    expect(result.status).toBe("failed");
    expect(result.failureReason).toBeTruthy();
  });
});
