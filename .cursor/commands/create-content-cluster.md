# Create Content Cluster

Turn **exactly five** proposed TubWise article topics into thoroughly researched,
audited, **unpublished** drafts. Preserve a manual approval gate: this command never
publishes, never generates images, never updates hubs, and never modifies existing
published articles.

**Cluster topics:** $ARGUMENTS

If fewer or more than five topics were supplied above, stop and ask the user for
exactly five titles or topic ideas before doing anything else. Accept topics
separated by newlines, commas, or numbered list markers.

Do not run these steps out of order. Do not skip inspection, topic validation,
research, the source/intent plan, the integrated audit, or validation. Do not depend
on prior conversation history; re-inspect the repository every time.

---

## Step 1 — Inspect the project

Before creating anything, inspect the live repository:

- Content schema: `src/content.config.ts`
- Existing published and draft articles: `src/content/articles/`
- Category routing and article path helpers: `src/utils/articles.ts`,
  `src/pages/**`
- Current category/specialized hubs (for example
  `src/pages/water-care/index.astro`, `src/pages/maintenance/index.astro`,
  `src/pages/troubleshooting/index.astro`, `src/pages/buying-guides/index.astro`,
  `src/pages/error-codes/**`)
- Search indexing and ranking: `src/utils/search.ts`, `src/utils/search-rank.ts`,
  search index page/route
- Sitemap and noindex logic: Astro sitemap config, `src/utils/indexing.ts`,
  layout/SEO components
- Article presentation and safety callouts: `src/layouts/ArticleLayout.astro`,
  safety callout components
- `relatedArticles` resolution behavior in article utilities/layout
- Featured-image frontmatter pattern (`featuredImage`, `featuredImageAlt`)
- Editorial style: `docs/editorial-guidelines.md` if present, plus recent published
  articles in the same topic area
- Existing articles that overlap the proposed cluster

Follow the live schema and site behavior if they differ from older notes in this
command.

---

## Step 2 — Validate the five topics

For each proposed article, determine:

- Exact search intent
- Overlap with every existing published and draft article
- Overlap within the proposed batch
- Correct `category` and `subcategory`
- Appropriate `safetyLevel`
- Whether the topic needs brand-, model-, controller-, or manual-specific scoping
- Whether reliable primary sources can support the article

**Reject or replace nothing silently.**

If a topic has meaningful overlap, insufficient primary sourcing, unsafe scope, or
ambiguous intent:

1. Stop before drafting that article
2. Explain the problem clearly
3. Recommend a distinct replacement topic
4. Do **not** create the replacement without explicit user approval

Do **not** force exactly five drafts when one or more topics fail validation. Draft
only the topics that pass validation (and any replacements the user explicitly
approves). If validation fails for part of the batch, continue only with approved
topics after the user responds, or stop the whole batch if the user prefers.

Do not invent statistics, first-hand testing, or unsafe homeowner procedures to make
a weak topic viable.

---

## Step 3 — Research

For each approved topic:

- Review current top-ranking pages **only** to identify expected subtopics, search
  intent, and content gaps
- Do **not** use competitor pages as factual sources
- Use primary sources for factual and safety claims

Preferred sources:

- Official manufacturer manuals
- Official manufacturer support pages
- Official product labels
- Official compatibility charts
- Official warranty documents
- Government guidance
- Recognized technical or safety documentation
- Official controller-system documentation

Do **not** use as factual authorities:

- Affiliate listicles
- Retailer descriptions
- Amazon reviews
- Reddit
- Forums
- Service-company blogs
- AI-generated summaries

Third-party mirrors of official manuals may be used only when:

- The original manufacturer is identified as the publisher
- The mirror is described only as the host
- The exact manual scope is clear

For every source, record title, publisher, URL when available, access date, product
or manual scope, and the exact claim(s) it supports.

---

## Step 4 — Build a source and intent plan

Before drafting, establish for each approved article:

- Exact title
- Slug
- Target URL
- Category
- Subcategory
- Search intent
- Reader problem
- `safetyLevel`
- Primary sources
- Intended internal links to **published** articles
- Overlap boundaries with other TubWise content
- Claims that must remain manufacturer- or model-specific
- Unsafe or unsupported competitor advice to exclude

Do not start drafting an article until its plan is complete.

---

## Step 5 — Draft

Create each approved article at `src/content/articles/<slug>.md` as:

- `draft: true`
- `noindex: true`
- `featured: false`
- `affiliateDisclosure: false` unless the user explicitly provides a different
  instruction

Use the existing TubWise frontmatter schema exactly. Required patterns typically
include `title`, `description`, `summary`, `slug`, `publishedDate`, `updatedDate`,
`category`, `subcategory`, `tags`, `author`, publication flags, `safetyLevel`,
`relatedArticles`, `sources`, and `faq` as the live schema requires.

Default writing target:

- Approximately 800–1,100 words
- Shorter is acceptable when the source scope does not support more
- Do not add filler merely to reach a word count

Writing style:

- Plain homeowner language
- Practical and direct
- Concise paragraphs
- Descriptive headings
- No em dashes
- No fake first-hand experience
- No unsupported superlatives
- No universal claims based on one manufacturer
- No vague “experts say” language
- No invented prevalence, success rates, timelines, or statistics

Every factual claim must be supported by a listed source.

Avoid unsupported terms such as:

- always
- usually
- commonly
- most common
- most likely
- in most cases
- guaranteed
- proven
- best
- safest
- most reliable

Keep manufacturer-specific guidance attributed. Do not convert marketing copy into
technical fact.

Match current article body conventions in the repo (direct answer, safety note when
needed, practical checks, stop conditions, natural internal links). Do not add a
visible Sources section unless current published articles do so consistently.

---

## Step 6 — Safety requirements

Apply the correct safety rules based on the article.

### Chemical content

- No unsupported dosing quantities
- No mixing products
- No casual switching between sanitizer systems
- Defer to the product label, confirmed water volume, current test results, and spa
  manual
- Do not imply one result proves water is safe

### Electrical or equipment content

- No control-box opening
- No wiring work
- No voltage, resistance, or continuity testing
- No jumpers or bypasses
- No pressure-switch adjustment
- No repeated breaker resets
- One reset only when the exact owner manual directs it
- Include clear technician stop conditions

### Buying guides

- No “best product” rankings
- No claims that TubWise tested products unless documented
- No live prices
- No affiliate links
- No compatibility guarantees
- Use desk-research methodology
- Note that specifications and availability can change

### Error codes

- Scope pages to the exact manufacturer, controller, model line, or manual
- Do not create universal code definitions
- The displayed code is not proof that a part failed
- Require readers to confirm the exact code in their own manual

---

## Step 7 — Internal links

Add natural internal links to existing **published** TubWise articles.

Requirements:

- Do not overload articles with links
- Do not imply that a linked symptom proves a diagnosis
- Do **not** modify existing published articles during draft creation
- All `relatedArticles` slugs must resolve to real article files
- Keep each article focused on its own search intent
- Prefer linking to published articles in body copy; draft-to-draft
  `relatedArticles` entries are allowed only when those draft files exist in this
  cluster and resolve

---

## Step 8 — Perform an integrated audit

After drafting, audit every created article before reporting completion.

The audit must check:

- Factual accuracy
- Source-to-claim support
- Source attribution
- Manual and model scope
- Safety language
- Commercial claims
- Compatibility claims
- Unsupported certainty
- Article overlap
- Internal links
- Metadata
- Publication flags (`draft: true`, `noindex: true`, `featured: false`)
- Schema compliance

Automatically correct clear issues in the drafts.

Do not add new sources unless necessary to repair a meaningful unsupported claim.

Do **not** publish. Do **not** generate images. Do **not** update hubs.

---

## Step 9 — Validation

Run:

```bash
npm run check
npm run build
```

Confirm:

- None of the new draft URLs appears in generated routes
- None appears in the sitemap
- None appears in `search-index.json`
- No draft-only hub becomes public
- All `relatedArticles` slugs resolve
- No image is attached unless the user explicitly requested one
- No affiliate link, price, tracking parameter, or buy CTA was added
- No localhost URLs appear

Fix schema, formatting, or link issues before reporting. Do not weaken factual
claims only to make the build pass.

---

## Step 10 — Report and stop

Report:

- Files created
- Final titles
- Word counts
- Exact search intent
- Category and subcategory
- `safetyLevel`
- Primary sources used
- Competitor subtopics reviewed
- Content gaps addressed
- Overlap decisions
- Claims removed, softened, or scoped
- Unsafe advice excluded
- Internal links added
- Remaining source uncertainty
- Check and build results
- Confirmation that all drafts remain unpublished

Also report any topics that failed validation and any replacement topics awaiting
user approval.

### Hard stops for this command

Do **not**:

- Publish (`draft` / `noindex` must remain `true`)
- Generate featured images
- Modify hubs, nav, or category listings
- Modify existing published articles
- Commit
- Push
- Deploy
- Silently invent replacement topics
- Force five drafts when validation failed

### Closing line

If exactly five drafts were created and audited, end with:

> Approval required before publication. Run `/publish-content-cluster` with these
> five filenames after reviewing this report.

If fewer than five drafts were created, end by listing the drafted filenames and
stating that `/publish-content-cluster` requires five already audited draft
filenames, so the user must approve replacements or complete the cluster before
publishing.
