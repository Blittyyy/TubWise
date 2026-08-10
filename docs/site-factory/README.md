# Site Factory Playbook

Reusable documentation for building niche SEO content websites using the architecture and editorial processes proven in TubWise.

This folder is **documentation only**. It does not create a starter repository, change production code, or copy niche-specific claims into templates.

## What this system does

The TubWise pattern is a static Astro site that:

1. Publishes researched problem-solving articles from a typed content collection
2. Groups articles into category hubs with subcategory sections
3. Separates drafts from published/indexable content with hard technical gates
4. Exposes internal search from a build-time JSON index
5. Adds differentiation with client-side calculators backed by pure utility functions and tests
6. Emits careful SEO metadata, canonicals, sitemap filters, and JSON-LD
7. Uses Cursor commands to draft and publish content clusters with approval gates

A future site can reuse the **systems**, adapt the **schema and categories**, and replace all **niche content, safety rules, branding, and sources**.

## What is reusable

| System | Why it travels |
|--------|----------------|
| Astro content collections + Zod schema | Typed frontmatter, safe defaults (`draft: true`) |
| Draft / noindex / placeholder indexing gates | Prevent unfinished pages from routes, search, and sitemap |
| Category hubs + dynamic article routes | Scalable IA without hand-building every page |
| SEO helpers (`buildTitle`, `absoluteUrl`, robots, OG/Twitter) | Consistent metadata |
| JSON-LD helpers (BlogPosting, CollectionPage, WebApplication, breadcrumbs) | Structured data without microdata duplication |
| Internal search index + ranking | Site search without a SaaS dependency |
| Calculator architecture (util → component → page → tests → registry) | Differentiation without backend storage |
| Legal page set + affiliate disclosure toggle | Launch hygiene |
| Self-hosted fonts + CSS variables | Performance and brand control |
| Cursor create/publish/write workflows | Repeatable editorial ops |
| Quality gates and audit cadence | Prevent thin/duplicate/unsafe pages |

## What remains niche-specific

| Area | Must be redesigned per niche |
|------|------------------------------|
| Categories, subcategories, hub copy | IA reflects the problem space |
| `safetyLevel` taxonomy and callout copy | Risk model differs by domain |
| Editorial guidelines and forbidden procedures | Legal/safety boundaries |
| Primary-source list | Manufacturers, agencies, manuals |
| Article body content and images | Never copy from TubWise |
| Error-code / brand routing (if any) | Only if the niche needs product-code pages |
| Calculator formulas and accuracy notices | Domain math only |
| Brand voice, colors, fonts, wordmark | Visual identity |
| Homepage curated guides and tool registry copy | Product positioning |
| Affiliate / monetization rules | Business model |

## Recommended order of operations

1. Fill out [`new-site-setup-template.md`](./new-site-setup-template.md)
2. Validate niche, sources, and excluded topics ([`launch-checklist.md`](./launch-checklist.md))
3. Scaffold Astro project from the extraction plan ([`starter-extraction-plan.md`](./starter-extraction-plan.md)) — later, as a separate task
4. Parameterize site constants, categories, navigation, and schema
5. Redesign visual tokens and legal pages
6. Publish a small high-quality seed cluster (not an arbitrary page count)
7. Add calculators only when formulas are accurate and source-supported
8. Wire analytics + Search Console
9. Run pre-launch audits ([`audit-playbook.md`](./audit-playbook.md), [`quality-gates.md`](./quality-gates.md))
10. Scale with create → approve → publish cluster workflow

## Minimum requirements before launch

- Live domain and absolute `site` URL in Astro config
- Legal pages: about, contact, privacy, terms, disclaimer; affiliate disclosure if monetizing
- Indexable seed content that passed overlap, source, and safety gates
- Working hubs that list only published articles
- Correct canonicals, robots, and sitemap exclusions
- Search index that excludes drafts/placeholders
- At least one author/editorial model stated on about or article frontmatter
- Analytics with privacy disclosure
- Search Console property ready for sitemap submission

Article count should follow **topic quality**, not a fixed number. A thin 40-article launch is worse than a strong 12-article launch.

## What should not be automated without review

- Topic acceptance when overlap or sourcing is weak
- Safety-critical instructions
- Publishing `draft: false` / `noindex: false`
- Affiliate claims, prices, ratings, Product/Review/Offer schema
- Manufacturer behavior generalized across brands
- Chemical dosing, electrical testing, or other high-risk procedures
- Featured images that could mislead (fake UI, unsafe practices)
- Forced reciprocal links that create cannibalization
- Search Console indexing requests for unfinished URLs
- Commits, pushes, and deploys inside content commands (TubWise commands deliberately stop before git)

## How to read this folder

| Doc | Use when |
|-----|----------|
| [`architecture.md`](./architecture.md) | Understanding system shape |
| [`content-workflow.md`](./content-workflow.md) | Running editorial production |
| [`content-schema.md`](./content-schema.md) | Designing frontmatter |
| [`seo-system.md`](./seo-system.md) | Metadata, indexing, schema.org |
| [`internal-linking.md`](./internal-linking.md) | Hub and reciprocal link standards |
| [`calculator-system.md`](./calculator-system.md) | Tools / utilities |
| [`image-system.md`](./image-system.md) | Featured images and social |
| [`design-system.md`](./design-system.md) | Visual tokens (brand must change) |
| [`quality-gates.md`](./quality-gates.md) | Pre-publish / pre-launch checks |
| [`launch-checklist.md`](./launch-checklist.md) | Phased go-live |
| [`audit-playbook.md`](./audit-playbook.md) | Recurring audits |
| [`cursor-command-inventory.md`](./cursor-command-inventory.md) | Adapting Cursor workflows |
| [`new-site-setup-template.md`](./new-site-setup-template.md) | Brief for the next niche |
| [`lessons-learned.md`](./lessons-learned.md) | Avoid TubWise failure modes |
| [`starter-extraction-plan.md`](./starter-extraction-plan.md) | Future generic starter repo |

## Accuracy labels used in these docs

- **Current behavior (TubWise):** what the live repo does today, with exact paths
- **Recommendation:** what a new site should do, even if TubWise differs
- **Niche-specific:** must not be copied as a universal default

## Non-goals of this documentation set

- Do not treat TubWise hot-tub facts as generic examples
- Do not create the starter repository yet
- Do not expose secrets, tokens, analytics IDs, or private deployment details
- Do not include font binaries or generated article images in docs
