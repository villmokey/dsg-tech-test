import { defineField, defineType } from "sanity";

/**
 * Landing page singleton: every field the marketing team edits for the
 * campaign landing page. Section order/visibility stays in code (documented
 * in README); all copy, images, and repeatable items are CMS-managed.
 */
export const landingPage = defineType({
  name: "landingPage",
  title: "Landing Page (Promo Akhir Tahun)",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Hero",
      type: "object",
      fields: [
        defineField({
          name: "eyebrow",
          title: "Label kecil di atas judul",
          type: "string",
          validation: (rule) => rule.required().max(80),
        }),
        defineField({
          name: "title",
          title: "Judul utama",
          type: "string",
          validation: (rule) => rule.required().max(120),
        }),
        defineField({
          name: "subtitle",
          title: "Subjudul",
          type: "text",
          rows: 3,
          validation: (rule) => rule.required().max(400),
        }),
        defineField({
          name: "image",
          title: "Gambar hero",
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Teks alternatif",
              type: "string",
              validation: (rule) => rule.required().max(200),
            }),
          ],
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "ctaLabel",
          title: "Teks tombol CTA",
          type: "string",
          validation: (rule) => rule.required().max(60),
        }),
        defineField({
          name: "ctaHref",
          title: "Tautan CTA",
          type: "string",
          initialValue: "/products",
          validation: (rule) => rule.required().max(200),
        }),
      ],
    }),
    defineField({
      name: "featuredProducts",
      title: "Produk unggulan (urutan = urutan tampil)",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "testimonials",
      title: "Testimoni",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "quote",
              title: "Kutipan",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required().max(400),
            }),
            defineField({
              name: "author",
              title: "Nama",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "role",
              title: "Jabatan",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
            defineField({
              name: "company",
              title: "Perusahaan",
              type: "string",
              validation: (rule) => rule.required().max(80),
            }),
          ],
          preview: {
            select: { title: "author", subtitle: "company" },
          },
        },
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "question",
              title: "Pertanyaan",
              type: "string",
              validation: (rule) => rule.required().max(200),
            }),
            defineField({
              name: "answer",
              title: "Jawaban",
              type: "text",
              rows: 4,
              validation: (rule) => rule.required().max(1000),
            }),
          ],
          preview: {
            select: { title: "question" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Landing Page — Promo Akhir Tahun" }),
  },
});
