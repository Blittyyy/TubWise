# Content Workflow

Complete article process used by TubWise and recommended for future niche sites.

This workflow is enforced partly by Cursor commands (`.cursor/commands/`) and partly by human/agent discipline. Not every step is automated software — several are **manual approval gates**.

---

## End-to-end process

### 1. Topic research

- Identify real search intents owners/users express
- Prefer problems with distinct diagnosis or decision value
- Skim SERPs **only** for expected subtopics and gaps — never as factual sources

**TubWise sources of truth for style:** `docs/editorial-guidelines.md`, recent published articles in the same category.

### 2. Intent validation

For each candidate topic, write down:

- Exact query / intent in one sentence
- What “done” means for the reader
- Category and subcategory
- Whether brand/model scoping is required
- Safety level

Reject vague umbrella topics that can only produce routing pages (“all noises explained”) when a narrower symptom page already covers the useful answer.

### 3. Overlap check

Compare against **every** published and draft article in `src/content/articles/`:

- Same primary intent?
- Same diagnosis path with different wording?
- Would internal links alone be enough instead of a new URL?

**Hard stop:** meaningful overlap → do not draft. Propose a replacement; wait for explicit approval (`create-content-cluster` behavior).

### 4. Primary-source validation

Gather sources that can support the claims you intend to make.

Preferred (pattern; niche list will differ):

- Official manufacturer manuals and support pages
- Official product labels / compatibility charts / warranty docs
- Government or recognized safety guidance
- Official controller/system documentation when relevant

Do **not** treat as factual authorities:

- Affiliate listicles, retailer blurbs, Amazon reviews
- Reddit/forums/service-company blogs
- AI-generated summaries
- Competitor SEO pages

Record for each source: title, publisher, URL, accessed date, scope (product/manual), and exact claim(s) supported.

**Hard stop:** cannot find enough primary support → drop or narrow the topic; do not invent.

### 5. Draft generation

Create Markdown under `src/content/articles/<slug>.md` matching `src/content.config.ts`.

Typical draft flags (create/publish pipeline):

```yaml
draft: true
noindex: true
featured: false
affiliateDisclosure: false
```

Structure guidance (from TubWise editorial docs — adapt per niche):

1. Direct answer near the top
2. Safety note
3. Likely causes / decision factors
4. Safe checks in order
5. What results mean
6. When to stop / call a professional
7. Related guides
8. Sources

Target length in `write-article-batch`: roughly 700–900 words unless the topic needs more for clarity — do not pad.

### 6. Draft / noindex controls

| Flag | Role |
|------|------|
| `draft: true` | Excludes from indexable set / routes / search / hubs |
| `noindex: true` | Extra robots protection; publish pipeline sets both false together |
| Placeholder text | Also blocks indexability via `hasPlaceholderContent` |

Default schema: `draft` defaults to `true` if omitted.

### 7. Review report

After drafting (especially cluster create), produce a report covering:

- Paths and slugs
- Intents and categories
- Sources and scope limits
- Overlap decisions / skipped topics
- Safety level and DIY vs professional boundaries
- Validation command results

### 8. Pre-publication safety and scope checks

Before flipping publish flags:

- No unresolved TODOs / placeholders / “TBD”
- Sources present and scoped correctly
- No unsafe procedures (niche guidelines)
- Claims do not universalize one manufacturer’s behavior
- `relatedArticles` slugs resolve to real indexable (or soon-to-be) articles
- Batch is all-or-nothing when using publish-cluster

### 9. Image generation

Only at publish time (TubWise `publish-content-cluster`):

- Unique photorealistic editorial image per article
- 1200×800, 3:2, WebP quality ~82
- Set `featuredImage` + `featuredImageAlt`
- Avoid misleading UI, fake error codes, unsafe practices

See [`image-system.md`](./image-system.md).

### 10. Hub placement

Update the relevant category hub so published articles appear in the correct subcategory group. List only published content. Do not create empty groups or fake links.

Some hubs auto-list via `getArticlesByCategory`; others also maintain explicit group arrays — follow the live hub file.

### 11. Reciprocal linking

Add brief, natural links from existing published pages that share intent adjacency. Do not force links from unrelated articles. Avoid cannibalizing anchors (see [`internal-linking.md`](./internal-linking.md)).

### 12. Search-index update

Happens automatically on `astro build` via `search-index.json.ts` for indexable articles. Verify new titles appear and drafts do not.

### 13. Sitemap inclusion

Happens automatically for built routes not excluded by sitemap filter. Verify new article URLs appear; `/search` and `/404` do not.

### 14. Build validation

Run:

```bash
npm run check
npm run build
npm run test:calculators   # when calculator code changed; otherwise still safe
```

Confirm drafts remain excluded from routes/search/sitemap when testing create-cluster.

### 15. Commit and deployment

**Current Cursor commands do not commit, push, or deploy.** That is intentional.

Human/agent should commit only when asked, then deploy via the normal host pipeline (TubWise: Vercel static).

### 16. Search Console monitoring

After deploy:

- Submit or refresh sitemap if needed
- Request indexing selectively for important new URLs
- Watch coverage, canonical conflicts, and query performance
- Expect reporting lag — absence of impressions early is not proof of a technical failure

---

## Why the workflow stops

| Stop condition | Reason |
|----------------|--------|
| Primary-source support is weak | Prevents invented authority and YMYL-style harm |
| Article overlaps existing content | Prevents cannibalization and thin duplicates |
| Article would be mostly routing | Hubs/links already serve navigation; a page needs unique answer value |
| Safe actionable guidance cannot be provided | Homeowner content must not become unsafe instructions |
| Topic cannot justify a separate page | Narrow wording variants of the same intent should not multiply URLs |
| Publish batch member fails audit | All-or-nothing publish prevents mixed cluster state |
| Wrong topic count for strict cluster commands | Forces deliberate batching and review |

**Failed topics should be dropped or replaced with approval — never padded to hit a count.**

---

## Command mapping (TubWise)

| Step | `write-article-batch` | `create-content-cluster` | `publish-content-cluster` |
|------|----------------------|--------------------------|---------------------------|
| Inspect schema/corpus | ✓ | ✓ | ✓ (verify drafts) |
| Overlap + source validation | ✓ (skip failures) | ✓ (approve replacements) | ✓ (block if not ready) |
| Draft with draft/noindex | ✓ | ✓ | — |
| Integrated audit report | lighter | ✓ | pre-pub verify |
| Flip publish flags | ✗ | ✗ | ✓ |
| Images + hubs + reciprocal | ✗ | ✗ | ✓ |
| Commit/deploy | ✗ | ✗ | ✗ |

See [`cursor-command-inventory.md`](./cursor-command-inventory.md).

---

## Research brief (optional but recommended)

Template: `docs/article-research-brief-template.md`

Use for high-risk or high-competition topics before drafting. Keep briefs out of the public site.
