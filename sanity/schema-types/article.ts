import { defineField, defineType } from "sanity";

/**
 * Article document. `published: false` keeps drafts off the public site (the
 * content layer only queries published articles); CMS preview for drafts is a
 * documented bonus, not included.
 */
export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Tips", value: "Tips" },
          { title: "Panduan", value: "Panduan" },
          { title: "Studi Kasus", value: "Studi Kasus" },
          { title: "Product Update", value: "Product Update" },
          { title: "Promo", value: "Promo" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Ringkasan (meta description)",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Gambar sampul",
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
      name: "body",
      title: "Isi artikel",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Subjudul", value: "h2" },
          ],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Tanggal publikasi",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "published",
      title: "Status: dipublikasikan",
      type: "boolean",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "relatedProducts",
      title: "Produk terkait (marketplace)",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      validation: (rule) => rule.max(6),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
