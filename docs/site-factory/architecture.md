# Architecture

How the TubWise-style site is structured, with placeholders for a future niche.

Labels:

- **Current behavior (TubWise):** exact paths in this repository
- **Generic pattern:** what to reproduce elsewhere
- **Niche-specific:** replace for `[NICHE]`

Placeholders: `[SITE_NAME]`, `[DOMAIN]`, `[NICHE]`, `[CATEGORY]`, `[SUBCATEGORY]`

---

## Annotated generic directory tree

```text
[SITE_NAME]/
├── astro.config.mjs              # site URL, trailingSlash, sitemap filter, Tailwind
├── package.json                  # check, build, calculator tests
├── public/
│   ├── robots.txt                # Allow /, Disallow query search URLs, Sitemap
│   ├── fonts/                    # Self-hosted WOFF2 + license texts
│   ├── images/
│   │   ├── articles/             # Featured WebP images
│   │   └── …                     # Brand/hero assets (niche)
│   ├── favicon.* 
│   └── og-default.*              # Fallback social image
├── scripts/
│   └── test-*.mjs                # Pure-util calculator tests
├── docs/
│   ├── editorial-guidelines.md   # Niche safety + voice (required rewrite)
│   ├── article-research-brief-template.md
│   └── site-factory/             # This playbook
├── .cursor/commands/
│   ├── create-content-cluster.md
│   ├── publish-content-cluster.md
│   └── write-article-batch.md
└── src/
    ├── content.config.ts         # Zod article schema + category/safety enums
    ├── content/articles/         # Markdown articles (draft or published)
    ├── data/
    │   ├── navigation.ts         # Primary nav + footer legal
    │   ├── categories.ts         # Homepage/help category cards (optional)
    │   ├── tools.ts              # Calculator/tool registry
    │   └── …                     # Niche registries (brands, homepage guides)
    ├── layouts/
    │   ├── BaseLayout.astro      # SEO head, analytics, chrome
    │   ├── PageLayout.astro      # Breadcrumbs + optional TOC/safety/affiliate
    │   └── ArticleLayout.astro   # Article chrome + BlogPosting schema
    ├── components/               # Cards, search, calculators, SEO, images
    ├── pages/
    │   ├── index.astro
    │   ├── 404.astro
    │   ├── search.astro          # Always noindex
    │   ├── search-index.json.ts  # Build-time search documents
    │   ├── [category]/[slug].astro
    │   ├── [CATEGORY]/index.astro   # One hub per content category
    │   ├── calculators/          # Tool pages (not MD articles)
    │   └── legal pages…
    ├── styles/global.css         # Fonts, @theme tokens, prose
    └── utils/
        ├── site.ts               # SITE_NAME, SITE_URL, defaults
        ├── seo.ts                # titles, absolute URLs
        ├── indexing.ts           # draft/noindex/placeholder gates
        ├── schema.ts             # JSON-LD builders
        ├── articles.ts           # paths, queries, breadcrumbs, safety copy
        ├── search.ts / search-rank.ts
        └── [tool]-*.ts           # Calculator pure utils
```

---

## Directory structure (current TubWise)

| Path | Role |
|------|------|
| `astro.config.mjs` | `site: 'https://gettubwise.com'`, `trailingSlash: 'never'`, sitemap excludes `/404` and `/search` |
| `src/content.config.ts` | Articles collection schema |
| `src/content/articles/*.md` | All editorial content |
| `src/utils/*` | SEO, indexing, schema, search, article helpers, calculator math |
| `src/data/*` | Nav, tools, homepage placeholders, error-code brands |
| `src/layouts/*` | Base → Page / Article |
| `src/pages/[category]/[slug].astro` | Standard article routes |
| `src/pages/error-codes/**` | **Niche-specific** brand/code routing |
| `src/pages/{water-care,troubleshooting,maintenance,buying-guides,calculators}/index.astro` | Category hubs |
| `public/robots.txt` | Crawl rules + sitemap URL |
| `scripts/test-hot-tub-*.mjs` | **Niche-specific** calculator tests |

There is **no** `vercel.json` in the current repo. Deployment is static Astro on Vercel with `@vercel/analytics` in `BaseLayout.astro`.

---

## Routing model

### Generic pattern

| URL shape | Source |
|-----------|--------|
| `/` | Homepage |
| `/[CATEGORY]` | Category hub page |
| `/[CATEGORY]/[slug]` | Standard article |
| `/calculators/[tool-slug]` | Standalone calculator pages |
| `/search` | Internal search UI (noindex) |
| `/search-index.json` | Search documents |
| Legal routes | Static Astro pages |

### Current behavior (TubWise)

- Standard articles: `/{category}/{slug}` via `src/pages/[category]/[slug].astro`
- Error-code articles: `/error-codes/{brand}/{errorCode}` via specialized routes — **not** `/{category}/{slug}`
- `getStaticPaths` uses **indexable** articles only (`draft` false, `noindex` false, no placeholder content)
- Collision guard: skips generating `[category]/[slug]` for `error-codes` slugs that collide with brand hub slugs

**Recommendation:** Keep one primary URL model per content type. If you need product-code URLs, isolate them like TubWise does rather than overloading the generic slug route.

---

## Layout hierarchy

```text
BaseLayout
  SeoHead (title, description, canonical, robots, OG, Twitter)
  optional JSON-LD script(s)
  Header + Footer
  <main>
    PageLayout OR ArticleLayout OR raw page content
```

| Layout | Responsibilities |
|--------|------------------|
| `BaseLayout.astro` | Document shell, SEO, analytics, skip link, site chrome |
| `PageLayout.astro` | Breadcrumbs, optional TOC, default safety/affiliate callouts, breadcrumb schema |
| `ArticleLayout.astro` | Category/subcategory, summary, dates, tags, featured image, safety copy, FAQ, sources, related articles, BlogPosting + breadcrumbs |

---

## Component responsibilities (selected)

| Component | Responsibility |
|-----------|----------------|
| `SeoHead.astro` | Meta + social tags |
| `Breadcrumbs.astro` | Visible crumb trail |
| `CategoryArchive.astro` | Hub listing + CollectionPage schema + optional `?q=` noindex |
| `ArticleCard.astro` | Compact article link card (no featured image today) |
| `RelatedArticles.astro` | Related slug resolution UI |
| `SafetyCallout.astro` | Warning aside |
| `ArticleSources.astro` / `ArticleFaq.astro` | Citations and FAQ UI |
| `OptimizedImage.astro` | `<img>` with width/height/loading — **not** Astro Image optimization |
| `SearchBar.astro` | Form + autocomplete against `/search-index.json` |
| `ToolCard.astro` | Calculator/tool registry cards |
| `*Calculator.astro` | Client-side tool UIs |
| `AffiliateDisclosure.astro` | Opt-in disclosure |
| `Wordmark.astro` | Brand mark (**niche branding**) |

---

## Content collection structure

**Current behavior:** one collection `articles` in `src/content.config.ts`, loader glob `./src/content/articles/**/*.{md,mdx}`.

See [`content-schema.md`](./content-schema.md) for every field.

Categories (TubWise enums — **niche-specific**):

`troubleshooting` | `water-care` | `error-codes` | `maintenance` | `calculators` | `buying-guides`

**Recommendation:** redefine `ARTICLE_CATEGORIES` for `[NICHE]`. Keep the pattern of a closed enum so hubs and nav stay consistent.

---

## How published and draft content are separated

Implemented in `src/utils/indexing.ts` and consumed by `src/utils/articles.ts`.

An article is **indexable** only when all are true:

1. `draft === false`
2. `noindex === false`
3. Body/description/summary/sources/FAQ do **not** match the placeholder pattern (`placeholder`, `research needed`, `todo:`, `tbd`, etc.)

Effects of non-indexable articles:

| Surface | Behavior |
|---------|----------|
| Static routes (`getStaticPaths`) | Omitted |
| Search index | Omitted |
| Hub article lists | Omitted |
| Related article resolution | Omitted |
| Sitemap | Omitted (no route built) |
| `ArticleLayout` robots | `noindex` when `draft \|\| noindex` (placeholders never get a page) |

**Default:** `draft` defaults to `true` in the Zod schema — unpublished until explicitly flipped.

**Recommendation:** Keep this triple gate. Do not rely on sitemap filters alone to hide drafts.

---

## How hubs discover and group content

**Current behavior:**

1. Hub pages call article helpers (e.g. `getArticlesByCategory('water-care')`) which return **indexable** articles only.
2. Many hubs pass articles into `CategoryArchive` and/or local subcategory groupings defined in the hub file (hand-maintained group keys matching `subcategory` frontmatter).
3. `categoryMeta` in `src/utils/articles.ts` supplies label, description, and hub `href`.
4. Error-code hubs additionally use `src/data/error-code-brands.ts` and brand-filtered article queries.

**Generic pattern:**

- Hub lists are **derived from published content**, not from a separate CMS list
- Subcategory groupings are editorial conventions encoded in hub pages
- Empty groups should not render fake links

---

## How search works

1. `src/pages/search-index.json.ts` builds documents at build time via `buildSearchIndex()` in `src/utils/search.ts`
2. Documents include slug, title, description, summary, category, tags, href, stripped body text
3. Only **indexable** articles are included
4. `src/pages/search.astro` loads the JSON client-side and ranks with `searchArticles` / `suggestArticles` from `src/utils/search-rank.ts`
5. `SearchBar.astro` posts/gets to `/search?q=` and may autocomplete from the JSON
6. Search page is always `noindex`; `robots.txt` disallows `/*?q=`

**Niche-specific today:** suggestion chips and ranking examples (`cloudy water`, `not heating`, etc.).

---

## How sitemap generation works

**Current behavior (`astro.config.mjs`):**

- `@astrojs/sitemap` integration
- Filter excludes pathname `/404` and `/search` (mirrors `NOINDEX_PATHS` in `src/utils/indexing.ts`, but **hardcoded separately**)
- Draft/placeholder articles never appear because they are not built as pages
- Output: `sitemap-index.xml` referenced from `public/robots.txt`

**Recommendation:** Prefer sharing one exclusion list between sitemap config and `NOINDEX_PATHS` to avoid drift.

---

## How canonical URLs are produced

1. `SITE_URL` from `src/utils/site.ts`
2. `absoluteUrl(path)` in `src/utils/seo.ts` joins site + path, normalizes trailing slash except root
3. `SeoHead.astro` emits `<link rel="canonical" href={…}>` from the page `path`
4. Site uses `trailingSlash: 'never'`

Canonicals should be absolute and query-free. Search and hub `?q=` states should not become alternate canonical URLs.

---

## How indexability is controlled

| Mechanism | Where |
|-----------|-------|
| Article `draft` / `noindex` | Frontmatter + `isIndexableArticle` |
| Placeholder detection | `hasPlaceholderContent` |
| Path noindex set | `NOINDEX_PATHS` (`/404`, `/search`) |
| Query noindex | Hubs/`CategoryArchive` set `noindex` when `?q=` present |
| robots meta | `SeoHead` (`noindex, nofollow` or `noindex, follow` via `robotsFollow`) |
| robots.txt | Disallow query URLs; allow rest |
| Sitemap filter | Exclude `/404`, `/search` |

---

## How structured data is attached

**Current behavior:** JSON-LD only via `<script type="application/ld+json">` from layout/page `schema` props. Helpers live in `src/utils/schema.ts`.

| Type | Typical attachment |
|------|--------------------|
| `BlogPosting` | `ArticleLayout` |
| `BreadcrumbList` | `PageLayout` / `ArticleLayout` |
| `CollectionPage` | Category hubs via `categoryHubSchema` / `CategoryArchive` |
| `WebApplication` | Calculator pages |
| `Organization` / `WebSite` | Homepage (and descriptions are currently hot-tub-specific) |

**Audit lesson:** Prefer a single JSON-LD channel. Do not also emit equivalent microdata that duplicates the same entities. Do not add `Offer`, aggregate ratings, or `Review` unless independently true and approved.

There is **no** `FAQPage` JSON-LD today even though `faq` frontmatter exists. **Recommendation:** emit FAQ schema only from validated non-placeholder FAQ items when present.

---

## How calculators fit into the architecture

Calculators are **not** Markdown articles (though category enum includes `calculators` for possible future MD).

Pattern:

```text
src/utils/[tool].ts          # Pure functions + validation
scripts/test-[tool].mjs      # Node tests
src/components/[Tool].astro  # Client script UI
src/pages/calculators/…      # Educational page + WebApplication schema
src/data/tools.ts            # Registry for hub cards
```

Inputs never leave the browser in the TubWise implementation (no cookies/network for calculator state).

See [`calculator-system.md`](./calculator-system.md).

---

## Site constants

**Current behavior (`src/utils/site.ts`):**

- `SITE_NAME`, `SITE_TAGLINE`, `SITE_URL`, `SITE_DESCRIPTION`, `DEFAULT_OG_IMAGE`

**Generic requirement:** every new site replaces these first. Astro `site` in `astro.config.mjs` must match `SITE_URL`.

---

## Analytics

**Current behavior:** `@vercel/analytics/astro` imported in `BaseLayout.astro`. No Speed Insights package. No `vercel.json`. Privacy page documents analytics.

**Recommendation:** Keep analytics in the base layout; document it in privacy; do not hardcode secret IDs in the repo (Vercel Analytics does not require a public measurement ID in source the way GA does).
