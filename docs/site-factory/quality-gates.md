# Quality Gates

Checklist used before publishing clusters and before launch. Includes hard stops.

Run gates with repository evidence (`npm run check`, `npm run build`, file inspection) — not conversational estimates.

---

## Content overlap

- [ ] Primary intent differs from every published and draft article
- [ ] Batch topics do not cannibalize each other
- [ ] Page is not a pure router to other URLs

**Hard stop:** meaningful overlap without a distinct angle.

---

## Source quality

- [ ] Technical claims cite primary or otherwise accepted authoritative sources
- [ ] Source scope (brand/model/manual date) matches claims
- [ ] No forum/affiliate/AI-summary-as-authority citations
- [ ] No placeholder citations

**Hard stop:** weak primary-source support for the article’s core claims.

---

## Factual scope

- [ ] Manufacturer-specific behavior is not universalized
- [ ] Uncertainty is stated honestly
- [ ] No invented statistics, testing, or credentials

**Hard stop:** claims exceed sources.

---

## Safety

- [ ] `safetyLevel` matches topic risk
- [ ] DIY vs professional boundaries are explicit
- [ ] Forbidden procedures for the niche are absent
- [ ] Safety callout renders correctly when required

**Hard stop:** cannot provide safe actionable guidance; or content instructs unsafe work.

---

## Metadata

- [ ] Unique `title` and `description`
- [ ] Slug is stable kebab-case
- [ ] Category/subcategory valid
- [ ] Dates and author set
- [ ] No duplicate conflicting meta tags on the rendered page

---

## Canonical

- [ ] Absolute canonical present
- [ ] Matches production `[DOMAIN]` + path
- [ ] Query-free
- [ ] Aligns with `trailingSlash` policy

---

## Indexability

- [ ] Published articles: `draft: false`, `noindex: false`
- [ ] Drafts: remain non-routable / non-indexed
- [ ] No placeholder strings in indexable content
- [ ] `/search` and `/404` stay noindex
- [ ] Search query URLs discouraged (`robots.txt` Disallow `/*?q=`)

---

## Sitemap

- [ ] New published URLs present after build
- [ ] Drafts absent
- [ ] `/search` and `/404` absent
- [ ] `robots.txt` Sitemap URL correct for `[DOMAIN]`

---

## Search index

- [ ] New articles present in `search-index.json` after build
- [ ] Drafts/placeholders absent
- [ ] Titles/hrefs correct (`articlePath`)

---

## Images

- [ ] Unique WebP per article when featuring images
- [ ] 1200×800 (or documented standard)
- [ ] `featuredImage` + `featuredImageAlt` paired
- [ ] Absolute social image URLs (no localhost)
- [ ] Temp intermediates removed
- [ ] Visual safety/accuracy review passed

---

## Internal links

- [ ] Hub lists the article
- [ ] `relatedArticles` slugs resolve
- [ ] Reciprocal/contextual links are natural, not forced
- [ ] No links to drafts

---

## Accessibility

- [ ] Images have alt + dimensions
- [ ] Controls labeled; focus visible
- [ ] Calculator errors and results announced appropriately
- [ ] Skip link works on base layout

---

## Calculator tests

- [ ] `npm run test:calculators` passes when tools changed
- [ ] Accuracy caveats present on pages
- [ ] No unsupported Offer/rating schema

---

## Build checks

```bash
npm run check
npm run build
```

- [ ] Type/content schema clean
- [ ] Build succeeds
- [ ] Spot-check built HTML for one article, one hub, one calculator, search noindex

---

## Deployment checks

- [ ] Production domain matches `SITE_URL` / Astro `site`
- [ ] HTTPS works
- [ ] Analytics loads as documented in privacy policy
- [ ] Critical redirects (if any) verified

---

## Search Console checks

- [ ] Property verified for `[DOMAIN]`
- [ ] Sitemap submitted
- [ ] Sample URLs inspected (canonical, indexability)
- [ ] No surge of duplicate/alternate conflicts after publish

---

## Hard-stop summary

Stop publishing when any of these are true:

1. Overlap / thin duplicate risk
2. Insufficient primary sources
3. Unsafe or out-of-scope instructions
4. Placeholder/TBD content
5. Failed check/build for the batch
6. Partial publish would leave a mixed cluster
7. Schema or rich-result claims that are untrue (ratings, offers, reviews)
