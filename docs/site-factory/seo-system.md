# SEO System

How TubWise handles metadata, indexing, social tags, and structured data — and what a new site should copy carefully.

---

## Title generation

**Current behavior (`src/utils/seo.ts` → `buildTitle`):**

- Appends ` | [SITE_NAME]` unless the title is already the brand or already contains the brand
- Used by `SeoHead.astro` for `<title>` and social title fields

**Article H1:** article `title` frontmatter rendered as page H1 in `ArticleLayout` — keep H1 aligned with the document title; do not invent a divergent marketing H1.

**Recommendation:** One clear title string in frontmatter drives H1 + `<title>` (+ brand suffix in `<title>` only).

---

## Meta descriptions

- Source: page prop or article `description`
- Emitted as `meta name="description"` and OG/Twitter description via `SeoHead.astro`
- Must be unique enough per URL; avoid sitewide boilerplate on articles

Placeholder descriptions prevent indexability (`hasPlaceholderContent`).

---

## H1 behavior

| Page type | H1 source |
|-----------|-----------|
| Article | Frontmatter `title` |
| Category hub | Hub heading from page / `categoryMeta.label` |
| Calculator | Tool name on the page |
| Legal / static | Page heading |

Only one H1 per page in practice.

---

## Canonical logic

**Current behavior:**

1. `SITE_URL` in `src/utils/site.ts` (must match `astro.config.mjs` `site`)
2. `absoluteUrl(path)` joins and normalizes trailing slashes (`trailingSlash: 'never'`)
3. `SeoHead` emits absolute canonical from `path`
4. Query parameters are not part of the canonical path

**Rules to keep:**

- Absolute URLs only
- Query-free canonicals
- Do not canonicalize to localhost
- Do not emit multiple conflicting canonical tags

---

## Robots directives

| Case | Behavior |
|------|----------|
| Normal public page | No robots meta (indexable) |
| `noindex` prop true | `noindex, nofollow` by default |
| Search page | `noindex` + `robotsFollow` → `noindex, follow` |
| Article draft or `noindex` frontmatter | `ArticleLayout` passes `noindex` |
| Hub with `?q=` | `CategoryArchive` / error-codes hub set noindex |

`public/robots.txt`:

```text
User-agent: *
Allow: /
Disallow: /*?q=
Sitemap: https://[DOMAIN]/sitemap-index.xml
```

**Recommendation:** Keep disallowing internal search query URLs even if the search page is already noindex.

---

## Sitemap inclusion / exclusion

**Current behavior (`astro.config.mjs`):**

- Includes built pages except pathname `/404` and `/search`
- Drafts/placeholders never built → never listed
- Filter set is duplicated vs `NOINDEX_PATHS` in `src/utils/indexing.ts`

**Recommendation:** Share one exclusion source of truth.

---

## Structured-data patterns

**Channel:** JSON-LD script tags only (`src/utils/schema.ts` + layout `schema` prop).

### BlogPosting

From `articleSchema(article)`:

- headline, description, dates, author/publisher Organization, mainEntityOfPage, articleSection, optional keywords/image

### CollectionPage

From `categoryHubSchema` for hubs.

### WebApplication

From `webApplicationSchema` on calculator pages (`applicationCategory` default `UtilitiesApplication`).

### Organization / WebSite

Homepage helpers — **descriptions are currently hot-tub-specific**; rewrite for `[NICHE]`.

### BreadcrumbList

From `breadcrumbSchema` on page/article layouts.

### Not implemented today

- FAQPage (despite FAQ frontmatter)
- Product / Offer / AggregateRating / Review

---

## Open Graph and Twitter

`SeoHead.astro` emits:

- `og:type` (`website` or `article`)
- `og:title`, `og:description`, `og:url`, `og:image`
- Twitter `summary_large_image` (default) with title/description/image

Image fallback: `DEFAULT_OG_IMAGE` (`/og-default.svg` absolute).

Articles with `featuredImage` use absolute featured image URL for OG/Twitter and BlogPosting.

---

## Image dimensions and URLs

| Use | TubWise convention |
|-----|--------------------|
| Featured article image | 1200×800 WebP under `/images/articles/` |
| Layout `<img>` | width/height 1200×800 via `OptimizedImage` |
| Social | Absolute URL to featured or default OG |

`OptimizedImage.astro` does **not** generate srcset; it is a disciplined `<img>` wrapper.

---

## Draft / noindex protections

Triple gate — see [`architecture.md`](./architecture.md) and `src/utils/indexing.ts`.

Do not:

- Include drafts in routes, search, or sitemap
- Index internal search-result URLs
- Leave `noindex: true` on finished public articles after publish

---

## Search-page and 404 behavior

| Page | Indexing |
|------|----------|
| `/search` | Always noindex; excluded from sitemap; query URLs disallowed in robots.txt |
| `/404` | In `NOINDEX_PATHS`; excluded from sitemap |

---

## Lessons from the TubWise SEO audit

Copy these as standing rules for new sites:

1. **Avoid duplicate JSON-LD and microdata** for the same entities — pick JSON-LD.
2. **Do not add unsupported Offers, ratings, or reviews** — inventing rich results risks manual issues.
3. **Avoid duplicate metadata** (multiple titles/descriptions/canonicals).
4. **Do not index internal search-result URLs.**
5. **Do not include drafts in routes, search, or sitemap.**
6. **Keep canonicals absolute and query-free.**
7. Technical SEO can be “correct” before traffic appears — Search Console lag ≠ broken site.
8. PageSpeed suggestions are not automatically required fixes; measure before churning.

---

## Implementation map (exact paths)

| Concern | File |
|---------|------|
| Site constants | `src/utils/site.ts` |
| Titles / absolute URLs | `src/utils/seo.ts` |
| Indexability | `src/utils/indexing.ts` |
| JSON-LD | `src/utils/schema.ts` |
| Meta tags | `src/components/SeoHead.astro` |
| Layout wiring | `src/layouts/BaseLayout.astro` |
| Sitemap filter | `astro.config.mjs` |
| robots.txt | `public/robots.txt` |
