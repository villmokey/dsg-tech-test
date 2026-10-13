# Kodeva Fullstack Skill Test — Coding Agent Brief

## 1. Goal

Build a polished, responsive campaign website and frontend-only mini marketplace for the fictional brand **Kodeva**, which sells subscription-licensed business software for SMEs (POS, HR/payroll, and add-ons). The campaign is **Promo Akhir Tahun**.

Prioritize a reliable, complete core experience over extra features. The expected effort is **6–8 hours** and the submission deadline is **2 calendar days** from receipt of the original brief. Record actual time spent.

## 2. Rules and constraints

- Write application code in **TypeScript**. A third-party CMS itself may use another language.
- Framework, CMS, database, hosting, UI library, state management, starter/template, and mock API approach are flexible. Choose the simplest stack that satisfies the requirements and explain each selected starter/template, boilerplate, library, state-management tool, and mock API in `README.md`. A ready-made CMS is allowed, including one not written in TypeScript.
- Deploy using a free hosting service/tier (for example, Vercel, Netlify, Railway, or Render); make sure the deployed site and CMS demo are accessible to reviewers.
- Use dummy content and data only. Never commit real personal data, credentials, or API keys. Include `.env.example` for required configuration.
- AI tools are allowed. Record actual usage and verification in `AI_LOG.md`.
- Maintain a visible, meaningful Git commit history; do not squash all work into one commit.
- Complete mandatory scope before attempting optional bonus features.

## 3. Required experience

### A. Campaign landing page and CMS

Create a landing page with these sections:

- Hero: editable title, subtitle, image, and CTA linking to the product catalog.
- Featured products.
- Testimonials.
- FAQ.

Requirements:

- A non-technical marketing user must be able to edit all section text, images, and repeatable items (products, testimonials, FAQ entries) from the CMS. The layout and section order may remain in code.
- Build a lead form collecting **name** and a contact method (**email and/or WhatsApp**). Validate input, apply basic spam protection, persist submissions, and make submitted leads viewable by the marketing team. If you choose to require both email and WhatsApp or only one, document that interpretation in `README.md`.
- Published CMS content must appear on the live website without a manual redeploy. Implement and document the cache/revalidation strategy and its expected propagation delay.
- Provide a working demo CMS/admin account for reviewers.

### B. Blog

- Blog index with pagination.
- Article detail pages with readable, stable **slug-based URLs**.
- CMS-managed fields: title, slug, cover image, rich-text body, category, draft/published status, and linked marketplace products.
- Draft articles must not be exposed as published content to public visitors.
- Make landing pages, blog articles, and products discoverable by search engines. Include meaningful page titles/descriptions, canonical URLs where appropriate, and Open Graph metadata so shared links preview well in WhatsApp. Use relevant structured metadata and other lightweight SEO essentials where practical; document anything intentionally deferred.

### C. Mini marketplace (frontend only)

Do **not** build a production backend, database, or real payment integration for the marketplace. Products may come from typed JSON fixtures or a mock API. Keep the user flow realistic and interactive.

**Catalog**
- Include at least **6 products**.
- Filter products by category.

**Product detail**
- Show feature screenshots/images, current price, crossed-out regular price when discounted, remaining promotional license quota, and package options: **Basic, Pro, Business**.
- Selecting a package must update the displayed price and all dependent totals immediately.

**Cart**
- Add items, change license quantity (users/outlets as appropriate for the product), and remove items.
- Calculate line totals and subtotal automatically.
- Persist the cart across page refreshes.
- Make the cart easy to access from every page and comfortable to use on mobile.
- Enforce promo quota across the **combined total quantity of the same product**, even when the cart contains multiple package variants of that product. Do not validate each cart row in isolation. Reject or constrain any add/update action that would exceed the remaining quota and show a clear message.

**Checkout**
- Collect buyer name and email with validation.
- Show an order summary before submission.
- Simulate payment outcomes for both success and failure. Display the appropriate status and preserve a sensible recovery path after failure.
- Create a mock order payload; include relevant UTM attribution in that payload.

**States and resilience**
- Handle loading, error, empty, and not-found states, including mock API failure and an empty cart.
- Use proper TypeScript types and centralize price, subtotal, and quota calculations to avoid inconsistent behavior.

### D. Marketing tracking and attribution

**GA4-style data layer**

Send events to `window.dataLayer` using GA4-style event names:

- `view_item`
- `add_to_cart`
- `begin_checkout`
- Landing-page CTA click (use a clear custom event name, such as `cta_click`, and document it)

Requirements:

- Events must correspond to actual user actions and include relevant product and campaign data in their payloads.
- Prevent duplicate event firing caused only by component re-renders. For example, fire interaction events inside the relevant action handler; guard any view event appropriately.
- No live GA account is required, but make events observable and provide evidence that they are emitted.

**UTM persistence**

- Capture incoming UTM parameters (at least `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`) from Instagram/TikTok campaign URLs.
- Preserve attribution while users navigate between pages and refresh before converting. Use an appropriate first-party persistence mechanism and document its lifetime/overwrite behavior.
- Include the retained UTM values in submitted lead data and the mock checkout order payload.
- Do not lose attribution when a user lands on the campaign page and submits a form from a different page.

### E. Mobile performance, usability, and future localization

- Responsive design, with mobile as a first-class experience.
- Target **Lighthouse mobile Performance score >= 80** for the landing page. Capture and include a screenshot of the mobile Lighthouse result.
- Optimize image sizes, avoid unnecessary JavaScript, and prevent layout shifts where practical.
- The scenario mentions future use in Malaysia and Singapore. Keep copy, locale, and currency choices configurable enough to support localization later; document whether full localization is included or deferred. Full translations are not explicitly required for this test.

## 4. Implementation guidance

1. Inspect the existing repository before making changes. Reuse sound conventions and avoid unnecessary rewrites.
2. Choose a stack and CMS that can be deployed on free tiers where practical. Keep the solution small and explain the decision in the README.
3. Define typed models for products, packages, cart lines, articles, leads, and mock orders. Use one shared source for calculations and validations.
4. Build the required happy paths first, then test quota, validation, persistence, event firing, and failure states.
5. Configure CMS content delivery so publishing a change triggers or is picked up by a documented revalidation mechanism without a manual deploy.
6. Add meaningful empty, loading, error, and success feedback; ensure keyboard access, labels, focus states, readable contrast, and appropriately sized mobile controls.
7. Do not add bonus features until every mandatory requirement and submission artifact is complete. If time runs short, finish and document a smaller reliable implementation rather than leaving broken flows.
8. Make commits that reflect coherent milestones (setup, CMS/landing/blog, marketplace/cart, tracking/UTM, QA/docs, for example).

## 5. Acceptance checklist

Use this as the final verification checklist before submission.

### Landing, CMS, and blog
- [ ] Hero, featured products, testimonials, and FAQ render from CMS-managed content.
- [ ] A demo admin can edit text/images/items and publish content without a developer.
- [ ] Published content becomes visible without a manual redeploy; caching/revalidation and delay are documented.
- [ ] Lead form validates input, applies basic spam protection, stores submissions, and lets marketing view them.
- [ ] Blog pagination works; article detail uses a slug URL.
- [ ] Article fields and draft/published visibility behave as required; related products can be linked.
- [ ] SEO and social-share metadata are present and appropriate.

### Marketplace
- [ ] Catalog has at least six products and category filtering works.
- [ ] Product detail shows screenshots/features, prices/discounts, remaining quota, and three package options.
- [ ] Package selection updates price correctly.
- [ ] Cart supports add/update/remove, accurate subtotal, and persistence after refresh.
- [ ] Promo quota is enforced across all package variants of the same product.
- [ ] Checkout validates buyer details, shows the order summary, and simulates success and failure.
- [ ] Loading, error, empty-cart, and not-found states are handled.
- [ ] Marketplace is responsive and the cart is easy to reach from all pages.

### Marketing and QA
- [ ] `view_item`, `add_to_cart`, `begin_checkout`, and landing CTA click events are observable in `dataLayer`.
- [ ] Events contain relevant product/campaign information and are not duplicated by re-renders.
- [ ] UTM parameters persist across navigation/refresh and appear in lead submissions and mock order payloads.
- [ ] Landing page Lighthouse mobile Performance is at least 80; screenshot is saved in the repository or linked from the README.
- [ ] Critical edge cases are manually or automatically tested and their verification is documented.

### Submission
- [ ] Repository is pushed to GitHub/GitLab with commit history intact.
- [ ] Deployed website is accessible and all required public paths work.
- [ ] Reviewer has a working CMS/admin demo account and access instructions.
- [ ] `README.md` and `AI_LOG.md` are complete.
- [ ] No real secrets or private customer data are committed.

## 6. Required documentation

### `README.md`

Include:

- Actual time spent.
- Local setup/run instructions and required environment variables.
- Live deployment URL, CMS/admin URL, and demo credentials or safe instructions for obtaining them. Use a free hosting service/tier for the deployment.
- Any template, boilerplate, starter kit, UI library, state-management tool, mock API, or other provided code used, with the reason for each choice.
- Brief architecture and reasons for stack/CMS/library/mock API choices.
- Assumptions for ambiguous requirements.
- What is complete, incomplete, and what would be improved with one additional week.
- CMS publishing/cache/revalidation behavior and expected delay.
- Marketplace future-backend integration plan covering:
  - Required API endpoints (e.g. products, order creation, payment initiation/status, webhook, license delivery).
  - Secure payment flow: server-side payment verification, signed/idempotent webhook processing, and order status transitions.
  - Accurate promo quota under concurrent orders (server-side atomic reservation/decrement and release/expiry strategy).
  - Delivery of license details only after verified successful payment.
- Mobile Lighthouse result screenshot.

### `AI_LOG.md`

Include:

- AI tools used and the tasks they supported.
- Two or three useful prompts.
- At least **two real examples** where AI output was wrong, incomplete, unsafe, or non-compliant. Explain how the issue was discovered, corrected, and verified. Do not invent examples; document actual development incidents.
- At least one AI-assisted implementation and the edge cases tested.
- Work intentionally written without AI and why.

## 7. Optional bonuses — only after mandatory acceptance criteria pass

- CMS controls for section order, visibility, or layout variants.
- Catalog search and price sorting, with filters reflected in shareable URLs.
- Subscription duration (monthly/yearly) and package feature comparison table.
- Scheduled publishing and automatic promo start/end dates.
- Simple vouchers with minimum spend and redemption limits.
- CMS preview for draft content.
- Automated tests for quota, totals, and voucher logic.

## 8. Evaluation priorities

The original assessment weights are:

| Area | Weight |
|---|---:|
| Functionality, code quality, TypeScript, project structure | 25% |
| Validation, error handling, and testing | 20% |
| Marketing requirements: CMS usability, mobile performance, tracking | 20% |
| Technical decisions and architecture | 15% |
| Documentation and AI log | 20% |

Use these weights to prioritize correctness, resilience, mobile performance, and honest documentation over bonus scope.

## 9. Submission procedure

Provide:

- Git repository URL (public, or private with access granted to `hendrawan.putra@dsg.id`); retain visible commit history and do not squash all work into one commit.
- Deployed website URL hosted on a free service/tier.
- CMS/admin demo access.
- `README.md`, `AI_LOG.md`, and Lighthouse screenshot.

Email the submission to `recruitment@dsg.id`, cc `hendrawan.putra@dsg.id` and `rochman.maarif@dsg.id`. Use the subject `[Skill Test] Fullstack Developer — [Full Name]`. For questions or unresolved ambiguity, the original brief lists `hendrawan.putra@dsg.id` as the contact.

For ambiguities, either document a reasonable assumption in `README.md` or ask the contact listed in the original brief. Do not silently omit ambiguous requirements.
