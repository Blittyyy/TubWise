# Launch Checklist

Phase-by-phase plan for launching a new niche site using this playbook.

Article count is **not** a vanity metric. Launch with as many high-quality, non-overlapping, source-supported pages as the niche can honestly support.

---

## Phase 0 — Niche validation

- [ ] Audience and jobs-to-be-done are clear
- [ ] Problem categories identified
- [ ] Excluded topics listed (legal/safety/thin)
- [ ] Primary-source ecosystem exists (manuals, agencies, standards)
- [ ] Differentiation angle exists (tools, scoped error codes, methodology, etc.)
- [ ] Complete [`new-site-setup-template.md`](./new-site-setup-template.md)

**Exit:** go / no-go decision.

---

## Phase 1 — Brand and domain

- [ ] `[SITE_NAME]` chosen
- [ ] `[DOMAIN]` registered
- [ ] Trademark/conflict quick check
- [ ] Voice and visual direction drafted (not copied from TubWise palette by default)

---

## Phase 2 — Project setup

- [ ] Astro project scaffolded (from future starter or manual extraction plan)
- [ ] `site` + `SITE_URL` set to production HTTPS URL
- [ ] `trailingSlash` policy set
- [ ] Categories, nav, schema enums parameterized
- [ ] `npm run check` / `npm run build` green on empty/seed state

---

## Phase 3 — Design

- [ ] CSS tokens redefined for brand
- [ ] Fonts self-hosted with licenses
- [ ] Wordmark/header/footer redesigned
- [ ] Article + hub templates reviewed on mobile
- [ ] Accessibility pass on chrome

---

## Phase 4 — Legal pages

- [ ] About
- [ ] Contact
- [ ] Privacy (include analytics disclosure)
- [ ] Terms
- [ ] Disclaimer appropriate to `[NICHE]`
- [ ] Affiliate disclosure if monetization may include affiliates

---

## Phase 5 — Initial content

- [ ] Seed cluster(s) drafted with draft/noindex
- [ ] Overlap + source + safety gates passed
- [ ] Published via controlled workflow
- [ ] Hubs list real articles only
- [ ] Reciprocal links selective

**Recommended minimum launch package (quality-first):**

- Core hubs live with honest empty states or real lists
- Legal set complete
- Homepage explains value clearly
- A **small** set of excellent articles (often on the order of one to a few clusters) beat a large thin corpus
- Optional: 1–3 calculators if formulas clear

Do not delay forever chasing an arbitrary “50 articles before launch” number.

---

## Phase 6 — Calculators or tools

- [ ] Only ship tools that pass the calculator checklist
- [ ] Tests green
- [ ] WebApplication schema without fake offers
- [ ] Registry cards accurate (`available` vs `coming-soon`)

---

## Phase 7 — Technical SEO

- [ ] Canonicals absolute
- [ ] robots.txt + sitemap filter correct
- [ ] Draft protections verified
- [ ] JSON-LD spot-checked (no duplicate microdata; no fake ratings)
- [ ] 404 and search noindex verified
- [ ] Run [`quality-gates.md`](./quality-gates.md)

---

## Phase 8 — Analytics

- [ ] Privacy-friendly analytics enabled in base layout
- [ ] Privacy policy updated
- [ ] No undeclared third-party pixels

---

## Phase 9 — Search Console

- [ ] Verify property
- [ ] Submit sitemap
- [ ] Inspect homepage + 2–3 key articles
- [ ] Request indexing sparingly for priorities

---

## Phase 10 — First indexing requests

- [ ] Prefer sitemap discovery first
- [ ] Manually request only canonical, finished URLs
- [ ] Do not request drafts, search URLs, or experiments

---

## Phase 11 — Post-launch monitoring

Week 1–2:

- [ ] Coverage / crawled status
- [ ] Unexpected noindex or canonical issues
- [ ] Broken hub links
- [ ] Analytics smoke check

Month 1+:

- [ ] Query impressions (expect lag)
- [ ] Cannibalization among similar articles
- [ ] Refresh outdated sources
- [ ] Schedule audits per [`audit-playbook.md`](./audit-playbook.md)
