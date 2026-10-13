import { defineField, defineType } from "sanity";

/**
 * Lead submission document — written by the site's /api/leads route (server
 * side, with a write token) and viewable by marketing in the Studio. Not
 * editable from the desk.
 */
export const lead = defineType({
  name: "lead",
  title: "Lead",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Nama", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "whatsapp", title: "WhatsApp", type: "string" }),
    defineField({
      name: "utm",
      title: "Atribusi kampanye (UTM)",
      type: "object",
      fields: [
        { name: "utm_source", title: "Source", type: "string" },
        { name: "utm_medium", title: "Medium", type: "string" },
        { name: "utm_campaign", title: "Campaign", type: "string" },
        { name: "utm_term", title: "Term", type: "string" },
        { name: "utm_content", title: "Content", type: "string" },
        { name: "capturedAt", title: "Waktu capture", type: "datetime" },
      ],
    }),
    defineField({ name: "landingPage", title: "Halaman pengiriman", type: "string" }),
    defineField({ name: "submittedAt", title: "Waktu submit", type: "datetime" }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
      media: "submittedAt",
    },
  },
});
