# Starter Extraction Plan

How to create a **separate** generic starter repository later, based on TubWise.

**Do not create that repository during the documentation task.** This file is the plan only.

---

## Goal of the future starter

A minimal Astro content-site skeleton that includes:

- Typed articles collection with draft/noindex/placeholder gates
- Parameterized site constants and categories
- Layouts + SEO + JSON-LD helpers
- Hub + dynamic article routing (generic; no niche error-code module by default)
- Search index + search UI
- One example calculator **with placeholder math** or a stub tool pattern
- Legal page shells
- Cursor commands with placeholders
- Docs linking back to this playbook

It must **exclude** TubWise articles, hot-tub images, hot-tub formulas, and TubWise brand identity.

---

## Classification legend

| Class | Meaning |
|-------|---------|
| **Copy unchanged** | Mechanism is niche-agnostic; keep logic |
| **Copy and parameterize** | Keep structure; replace strings/enums/tokens |
| **Rebuild generically** | Pattern is right; implementation too niche-coupled |
| **Exclude** | Do not put in starter |
| **Niche content only** | Remains in TubWise; reference as example only |

---

## File / system classification

### Config and package

| Item | Class | Notes |
|------|-------|-------|
| `astro.config.mjs` pattern | Copy and parameterize | Swap `site` domain; keep sitemap filter + Tailwind |
| `package.json` scripts | Copy and parameterize | Rename package; keep check/build; generic test script names |
| `tsconfig.json` | Copy unchanged | |
| `AGENTS.md` / `CLAUDE.md` Astro tips | Copy and parameterize | Remove TubWise assumptions if any |

### Layouts

| Item | Class | Notes |
|------|-------|-------|
| `BaseLayout.astro` | Copy and parameterize | Swap analytics/privacy assumptions carefully |
| `PageLayout.astro` | Copy unchanged (pattern) | Safety defaults may need niche copy hooks |
| `ArticleLayout.astro` | Copy and parameterize | Remove hot-tub-only assumptions in chrome |

### Components

| Item | Class | Notes |
|------|-------|-------|
| `SeoHead`, `Breadcrumbs`, `CategoryArchive`, `ArticleCard`, `RelatedArticles`, `ArticleSources`, `ArticleFaq`, `SearchBar`, `ToolCard`, `OptimizedImage`, `AffiliateDisclosure`, `SafetyCallout`, `TableOfContents`, `Header`, `Footer`, `HelpCategoryNav`, `CategoryCard` | Copy and parameterize | Replace copy/brand classes as needed |
| `Wordmark.astro` | Rebuild generically | New brand mark |
| `HotTub*Calculator.astro` | Exclude / rebuild generically | Keep one `ExampleCalculator` stub or empty tools state |

### Utils

| Item | Class | Notes |
|------|-------|-------|
| `seo.ts`, `indexing.ts` | Copy unchanged | |
| `schema.ts` | Copy and parameterize | Rewrite Organization/WebSite descriptions |
| `site.ts` | Copy and parameterize | All constants |
| `articles.ts` | Copy and parameterize | `categoryMeta`, `safetyCopy` must be rewritten; error-code helpers optional module |
| `search.ts` | Copy unchanged | |
| `search-rank.ts` | Copy and parameterize | Suggestion chips and examples |
| `strings.ts` | Copy unchanged | |
| `hot-tub-*.ts` | Niche content only / Exclude | |

### Content config

| Item | Class | Notes |
|------|-------|-------|
| `content.config.ts` | Copy and parameterize | New categories; redesign safety enum; optional brand/errorCode fields omitted by default |
| `src/content/articles/*` | Niche content only | Ship 0–2 **placeholder example** drafts max, clearly fake |

### Data

| Item | Class | Notes |
|------|-------|-------|
| `navigation.ts` | Copy and parameterize | |
| `tools.ts` | Rebuild generically | Empty or stub tools |
| `categories.ts` | Copy and parameterize | |
| `articles.ts` homepage guides | Rebuild generically | Empty curated list or stubs |
| `error-code-brands.ts` | Exclude (optional plugin later) | |

### Search

| Item | Class | Notes |
|------|-------|-------|
| `search.astro`, `search-index.json.ts` | Copy unchanged | |

### Calculators

| Item | Class | Notes |
|------|-------|-------|
| Architecture pattern | Copy unchanged | |
| Hot-tub pages/utils/tests | Exclude | |
| Example stub calculator | Rebuild generically | Optional |

### Legal pages

| Item | Class | Notes |
|------|-------|-------|
| about/contact/privacy/terms/disclaimer/affiliate-disclosure pages | Copy and parameterize | Replace all copy; no TubWise legal text as final |

### Analytics

| Item | Class | Notes |
|------|-------|-------|
| `@vercel/analytics` in BaseLayout | Copy and parameterize | Optional; document privacy |
| `vercel.json` | N/A | Not present in TubWise |

### Styles and fonts

| Item | Class | Notes |
|------|-------|-------|
| `global.css` structure | Copy and parameterize | Retokenize colors; optionally swap fonts |
| TubWise WOFF2 files | Exclude or replace | Do not treat as default brand; include licenses only for fonts you ship |
| Forced light-mode pattern | Copy and parameterize | Optional per brand |

### Images

| Item | Class | Notes |
|------|-------|-------|
| `public/images/articles/*` hot-tub WebPs | Exclude | |
| `og-default`, favicons | Rebuild generically | |
| Image system conventions | Document only (see image-system.md) | |

### Article content / research briefs

| Item | Class | Notes |
|------|-------|-------|
| All TubWise Markdown articles | Niche content only | |
| `docs/editorial-guidelines.md` | Rebuild generically | Template empty rules for niche |
| `docs/article-research-brief-template.md` | Copy and parameterize | |
| `docs/research-briefs/*` | Exclude | |
| `docs/site-factory/*` | Copy unchanged into starter docs | |

### Cursor commands

| Item | Class | Notes |
|------|-------|-------|
| create / publish / write commands | Copy and parameterize | Replace niche lists; keep gates |

### Scripts / tests

| Item | Class | Notes |
|------|-------|-------|
| `scripts/test-hot-tub-*.mjs` | Exclude | |
| Generic `test:calculators` harness | Rebuild generically | |

### Pages / routes

| Item | Class | Notes |
|------|-------|-------|
| `[category]/[slug].astro` | Copy unchanged | |
| Generic category hub pages | Rebuild generically | One templated hub or sample hubs with placeholders |
| `error-codes/**` | Exclude (optional later package) | |
| `calculators/**` hot-tub pages | Exclude | |
| `index.astro` | Rebuild generically | New homepage composition |
| `404.astro` | Copy and parameterize | |

---

## Suggested extraction steps (future task)

1. Create new empty git repo (not inside TubWise)
2. Copy parameterized skeleton files per classification above
3. Replace all `[SITE_NAME]`, `[DOMAIN]`, category enums, safety copy
4. Confirm zero hot-tub strings in `src/` (search for niche terms)
5. Add example draft article with `draft: true`
6. Port Cursor commands with placeholders
7. Copy `docs/site-factory/` 
8. Run check/build
9. Document how to fill [`new-site-setup-template.md`](./new-site-setup-template.md)

---

## Top systems to extract first

See final report in the documentation task response; summary:

1. Indexing gates + article helpers
2. SEO head + schema helpers + sitemap/robots pattern
3. Content schema + article layout/hub routing
4. Search index + ranking UI
5. Cursor create/publish workflow

---

## Explicit non-goals for the starter

- No TubWise content corpus
- No promise of rankings
- No affiliate product widgets
- No fabricated schema rich results
- No requirement to keep TubWise visual identity
