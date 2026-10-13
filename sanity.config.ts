import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import type { StructureBuilder } from "sanity/structure";
import { schemaTypes } from "./sanity/schema-types";

/**
 * Sanity Studio config, embedded at /studio via app/studio/[[...tool]]/page.tsx.
 * projectId/dataset come from env (NEXT_PUBLIC_*); see .env.example.
 */
export default defineConfig({
  name: "default",
  title: "Kodeva CMS",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  basePath: "/studio",
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (structure: StructureBuilder) => {
        // Landing page is a singleton; leads are read-only records.
        return structure.list().items([
          structure.documentTypeListItem("landingPage").title("Landing Page"),
          structure.divider(),
          structure.documentTypeListItem("product").title("Products"),
          structure.documentTypeListItem("article").title("Articles"),
          structure.divider(),
          structure.documentTypeListItem("lead").title("Leads"),
        ]);
      },
    }),
  ],
});
