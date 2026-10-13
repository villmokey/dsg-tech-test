import { defineField, defineType } from "sanity";

/**
 * Product document. `productId` is the stable site-facing id ("pos",
 * "payroll", ...) used by landing features and article relations — separate
 * from the Sanity document _id so content can be re-imported safely.
 */
export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "productId",
      title: "ID produk (stabil, dipakai situs)",
      type: "string",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "slug",
      title: "Slug URL",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Nama produk",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          { title: "Point of Sale", value: "pos" },
          { title: "HR & Payroll", value: "hr-payroll" },
          { title: "Add-on", value: "addons" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "unit",
      title: "Satuan lisensi",
      type: "string",
      options: {
        list: [
          { title: "Per outlet", value: "outlet" },
          { title: "Per pengguna", value: "user" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: "description",
      title: "Deskripsi",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().max(1000),
    }),
    defineField({
      name: "features",
      title: "Fitur unggulan",
      type: "array",
      of: [{ type: "string" }],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "images",
      title: "Gambar / screenshot",
      type: "array",
      of: [
        {
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
        },
      ],
    }),
    defineField({
      name: "promoQuotaRemaining",
      title: "Sisa kuota lisensi promo",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "promoQuotaTotal",
      title: "Total kuota lisensi promo",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "badge",
      title: "Badge (opsional, mis. Terlaris)",
      type: "string",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "packages",
      title: "Paket (Basic, Pro, Business)",
      type: "array",
      validation: (rule) => rule.required().min(3).max(3),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "id",
              title: "ID paket",
              type: "string",
              options: {
                list: [
                  { title: "Basic", value: "basic" },
                  { title: "Pro", value: "pro" },
                  { title: "Business", value: "business" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "name",
              title: "Nama paket",
              type: "string",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "monthlyPrice",
              title: "Harga promo / lisensi / bulan (IDR)",
              type: "number",
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: "regularMonthlyPrice",
              title: "Harga reguler (dicoret, kosongkan jika tanpa diskon)",
              type: "number",
            }),
            defineField({
              name: "highlights",
              title: "Poin keunggulan paket",
              type: "array",
              of: [{ type: "string" }],
              validation: (rule) => rule.max(5),
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "id" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "productId" },
  },
});
