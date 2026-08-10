# Audit Playbook

How to audit a TubWise-style SEO content site. Based on the technical and content audits performed on TubWise.

Audits should produce written findings with URLs and file paths. Prefer repository/build evidence over memory.

---

## Audit types

### 1. Technical crawl / index audit

**Check:**

- Which routes build?
- Which URLs are in sitemap?
- Drafts/placeholders absent from routes, sitemap, search index
- `/search`, `/404`, and `?q=` handling
- robots.txt Sitemap target and Disallow rules
- `SITE_URL` / Astro `site` alignment
- trailing slash consistency

**How (practical):** `npm run build`, inspect `dist/`, `dist/sitemap*.xml`, `dist/search-index.json`, spot-check HTML robots/canonical.

### 2. Metadata audit

**Check:**

- Unique titles/descriptions on sample of pages
- Brand suffix behavior
- OG/Twitter completeness
- Featured image absolute URLs
- No duplicate meta tags

### 3. Overlap audit

**Check:**

- Articles with near-identical intents
- Narrow symptom pages that only restate a parent guide
- Cluster candidates that should be dropped rather than padded
- Anchor text that pits siblings against each other

**How:** inventory titles/slugs/categories; map primary intents; flag collisions before drafting more.

### 4. Internal-link graph

**Check:**

- Hub coverage for every published article
- relatedArticles resolution
- Reciprocal/contextual link quality
- Orphans (no hub + no inbound)
- Calculator ↔ article links

### 5. Schema audit

**Check:**

- BlogPosting / CollectionPage / WebApplication / BreadcrumbList validity
- Organization/WebSite descriptions still accurate
- No Product/Offer/AggregateRating/Review unless true
- No duplicate JSON-LD + microdata for same entities
- FAQ schema only if FAQs exist and are clean (TubWise currently has UI without FAQPage JSON-LD)

### 6. Image audit

**Check:**

- Dimensions/format conventions
- Unique images vs reused assets
- Alt quality
- Misleading/unsafe imagery
- Broken image paths in frontmatter

### 7. Calculator audit

**Check:**

- Formula correctness vs stated assumptions
- Tests present and passing
- Caveats visible
- Privacy claims accurate
- Tool registry status honest

### 8. Accessibility audit

**Check:**

- Skip link, focus visibility
- Nav toggles ARIA
- Image alts
- Form labels and error association
- aria-live on dynamic results

### 9. PageSpeed testing

**Check:**

- LCP/CLS/INP on homepage, article, calculator
- Font strategy (self-host vs third-party)
- Oversized images

**Interpretation lesson:** PageSpeed suggestions are not automatically required fixes. Prefer changes with clear user/performance value (e.g. self-hosting fonts) over churn.

### 10. Search Console review

**Check:**

- Sitemap processing
- Indexed vs not indexed reasons
- Canonical disagreements
- Query performance once data exists
- Manual actions / rich result issues

**Interpretation lesson:** reporting can lag; early zero-impression periods do not by themselves prove technical failure if crawl/index setup is sound.

---

## When to run each audit

| Timing | Priority audits |
|--------|-----------------|
| **Before launch** | Technical index, metadata, schema, safety/overlap on seed content, images, a11y chrome, calculators if shipping |
| **After 25–50 pages** | Overlap, internal-link graph, metadata uniqueness, sitemap/search index sampling |
| **After 60–75 articles** | Full overlap cannibalization pass, hub IA rethink, schema sampling at scale, Search Console query conflicts |
| **After major architecture changes** | Technical index, schema, routing/canonical, search index, build/test suite |
| **Once Search Console has meaningful data** | Coverage vs intent map, performance by template type, refresh candidates, thin-page pruning |

---

## Suggested output format

For each finding:

1. Severity (blocker / should-fix / note)
2. Evidence (URL or path)
3. Expected behavior
4. Recommended action
5. Whether it is reusable-system vs niche-content

---

## Relation to quality gates

Pre-publish cluster checks are a subset of this playbook. Full audits are periodic and broader. See [`quality-gates.md`](./quality-gates.md).
