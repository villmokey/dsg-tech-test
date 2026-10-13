# AI_LOG — Kodeva Fullstack Skill Test

Records actual AI usage during this submission: what was used, where it helped, where it was wrong, and how errors were found, fixed, and verified. Nothing here is invented; each incident below corresponds to a real failure encountered during this session and is reproducible from the commit history.

## AI tools used

| Tool | What it did |
|---|---|
| **Command Code** (agentic coding CLI, autonomous end-to-end execution) | All production code: domain model, pricing/quota engine, content layer, Sanity schemas/studio wiring, cart/checkout, tracking, SEO, tests, docs. Also ran the verification suite (typecheck, lint, vitest, production build, headless-browser smoke tests, Lighthouse). |
| **Web search + primary documentation** (verification, not generation) | Every Next.js 16 API used was verified against the version-pinned docs bundled in `node_modules/next/dist/docs/` (Cache Components, `revalidateTag` profile argument, `proxy.ts` rename, removal of `dynamic` segment configs) and the Sanity import docs for the `"_sanityAsset": "image@file://…"` seed format. |

The author directed the work, reviewed outputs, and set repo conventions (e.g. commit-message style). No code was committed that had not passed `typecheck + lint + test + build`, and critical flows were additionally verified with an automated headless-browser session (see "Verification" below).

## Useful prompts

1. *"This is NOT the Next.js you know — read node_modules/next/dist/docs before writing code."* (from the repo's `AGENTS.md`, carried into every instruction) — this single constraint reshaped the implementation: `revalidateTag(tag, profile)`, `use cache`/`cacheTag`, runtime-APIs-behind-Suspense, and the `proxy` rename were all taken from the bundled docs instead of training-data habits.
2. *"Execute everything on this markdown."* (pointing at `CODING_AGENT_BRIEF.md`) — the whole build ran as one autonomous pass with a milestone-commit plan derived from the brief's own suggested milestones (setup → CMS/landing/blog → marketplace/cart → tracking → QA/docs).
3. *"Smoke-test a locally running Next.js app: verify landing sections, add-to-cart + quota enforcement, checkout success/failure, dataLayer events, UTM persistence."* — produced the headless-browser session that caught two real bugs (stale persisted toast; a wrong test contract) and generated the observability evidence below.

## Where AI output was wrong, incomplete, or non-compliant — real incidents

### 1. Sanity client crashed the production build (module-scope construction)

- **What happened:** the first full build failed with `Configuration must contain projectId` — the AI had created the Sanity client at module scope, and `createClient` throws when env vars are absent (fixture mode / fresh clone has none).
- **How it was found:** `pnpm build` failed during "Collecting page data for /api/leads".
- **Fix:** lazy client creation (`getReadClient()` / `getWriteClient()`) plus a lazily-built image URL builder, so nothing constructs a client unless the CMS is actually configured.
- **Verification:** clean build with **no** env vars (fixture mode), plus a build with a dummy `NEXT_PUBLIC_SANITY_PROJECT_ID` to prove the CMS path also compiles.

### 2. Embedded Studio could not be prerendered under Next 16 Cache Components

- **What happened:** three successive build failures on `/studio/[[...tool]]`: (a) exporting `metadata` from a `"use client"` page is disallowed in Next 16 (the pattern in next-sanity's docs targets Next 15); (b) after moving metadata to a server page, the Studio's SSR still tripped the Cache Components prerender validation; (c) `export const dynamic = "force-dynamic"` — the reflex fix — **was removed in Next 16 when Cache Components is enabled** (confirmed in the bundled route-segment-config docs).
- **How it was found:** build errors, then a dev-server run showing the underlying `Configuration must contain projectId` throw masked behind a misleading "uncached or runtime data in generateMetadata()" message.
- **Fix:** split into a server page + client `StudioClient`; replaced `force-dynamic` with the Next 16 escape hatch — `await connection()` inside a Suspense boundary so the route renders at request time — and added a graceful setup notice when env vars are missing.
- **Verification:** build passes with and without env vars; route appears in the build output as a partial-prerender entry; `/studio` renders the setup notice in fixture mode and was smoke-tested for the shell.

### 3. Unstable values broke prerendering (`new Date()`)

- **What happened:** Cache Components rejected `new Date().getFullYear()` rendered in the footer and landing heading, and `useRef(Date.now())` in the lead form ("encountered the unstable value … while prerendering").
- **How it was found:** production build failures naming the exact components.
- **Fix:** year computed once at module scope (build-time constant per deployment, the bundled docs' recommended pattern); the form timestamp moved fully into the mount effect (`useRef(0)`).
- **Verification:** clean build; landing page prerenders as a static shell.

### 4. The Sanity Desk structure option was silently inert

- **What happened:** the AI set `structure: (S) => …` directly on `defineConfig` — but that option only takes effect inside the `structureTool()` plugin. The custom sidebar (Landing singleton, Leads section) would never have appeared for the marketing user.
- **How it was found:** ESLint flagged `structureTool` as an unused import — a warning that exposed a real functional bug.
- **Fix:** `plugins: [structureTool({ structure: … })]`.
- **Verification:** typecheck/lint clean; the Studio compiles with the plugin config.

### 5. A unit test encoded the wrong contract (AI misunderstood its own API)

- **What happened:** the AI wrote a test expecting `applyCartChange` to *merge* quantities ("add 6 to existing 4 → 10"), but the engine's documented contract is an **absolute target quantity** (the cart store computes `existing + added` before calling). The test failed.
- **How it was found:** `pnpm test` — 29 passed, 1 failed.
- **Fix:** after re-reading the implementation, the test was corrected to the absolute-target contract (the engine was right; the test was wrong) and a comment now documents the contract and where merging happens.
- **Verification:** 30/30 tests pass; the store-level merge behavior is separately exercised in the browser smoke test.

### 6. Transient UI state leaked into persisted storage

- **What happened:** `zustand persist` (default: persist everything) saved the cart's transient `lastError`, so a quota-error toast from the product page re-appeared on a later visit to `/cart` — found during the headless-browser smoke test, not by any static check.
- **Fix:** `partialize` the persistence to `{ lines }` only.
- **Verification:** replayed the exact scenario headlessly — toast no longer resurrects; cart lines still survive reload.

### 7. Sanity Desk structure crashed at runtime ("`id` is required for lists")

- **What happened:** the custom Studio sidebar was written as `structure.list().items([...])` — the zero-argument `list()` pattern from older Sanity versions. In the installed Sanity v6, `ListInput.id` is **required**, so the desk threw "`id` is required for lists" as soon as a reviewer opened `/studio` with the CMS configured. Static checks (typecheck, lint, build) all passed because the zero-arg overload still exists in the types.
- **How it was found:** manually, by the author, opening `/studio` — not by any automated check.
- **Fix:** the root list now passes the options object with an explicit `id: "root"` and `title`, verified against the `StructureBuilder` type definitions shipped in `node_modules/sanity/lib`.
- **Verification:** `tsc` against the typed `ListInput` (which requires `id`), clean build, and author confirmation that the desk renders.

### 8. Vercel deploy failed prerendering `/_not-found` (`Invalid URL`)

- **What happened:** the first Vercel deployment failed with `Error occurred prerendering page "/_not-found"`. Root cause: the root layout evaluates `metadataBase: new URL(siteConfig.url)`, and the author's `NEXT_PUBLIC_SITE_URL` on Vercel was set **without a protocol** (`kodeva.vercel.app`), so `new URL()` threw at module evaluation during prerender. Locally the variable is unset (localhost default), which is why the build never failed before deploying.
- **How it was found:** reproduced locally by running `NEXT_PUBLIC_SITE_URL=kodeva.vercel.app pnpm build` — identical stack trace to the Vercel log, confirming the diagnosis before patching.
- **Fix:** `siteConfig.url` now runs through a `normalizeSiteUrl` helper that prepends `https://` when the protocol is missing and strips trailing slashes.
- **Verification:** clean builds with a protocol-less URL, a full URL, and no env var at all.

## AI-assisted implementation and edge cases tested

The **cross-variant promo-quota engine** (`lib/marketplace/pricing.ts`) was implemented AI-assisted and validated on three levels:

- **Unit (vitest, 30 tests):** line totals; subtotal with missing catalog entries (graceful drop); quota summed across Basic/Pro/Business of one product; rejection with the exact remaining allowance (`maxAllowedForLine`); boundary case "add exactly to quota"; zero/negative quantities; row removal at 0; input-array immutability; `validateCartForCheckout` first-violator reporting; lead contact-method rule (email-only / WhatsApp-only / both / neither); payment-simulation determinism.
- **Server (curl):** valid order recomputes prices server-side; combined 40-license quota enforced with HTTP 422 and a clear Indonesian message; `+fail` email deterministically fails; empty-cart and malformed payloads 400.
- **Headless browser (real UI):** add 40 Basic → attempt Pro add → rejected with "Kuota promo untuk Kodeva POS sudah habis." and cart unchanged; quantity clamp; persistence across reload; checkout success clears the cart, failure preserves it with a recovery path.

## Work intentionally written without AI — honest answer

**None.** All production code in this repository was AI-generated (Command Code), and claiming otherwise would be inventing history. What *was* deliberately done without leaning on AI recall: API-correctness research — the Next.js 16 behavior (Cache Components model, removed segment configs, `revalidateTag` signature, ISR first-hit 404 nuance) and the Sanity seed asset format were taken from primary, version-pinned documentation rather than generated content, precisely because incident #2 above showed how confidently wrong AI recall can be about this framework version.
