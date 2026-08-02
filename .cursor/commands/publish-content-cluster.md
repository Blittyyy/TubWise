# Publish Content Cluster

Take **exactly five** already audited TubWise draft filenames, publish them
together, update the surrounding site, generate featured images, and validate the
completed cluster.

This command is the publication half of the five-article workflow. It must not
accept raw topics that have not already been drafted and audited by
`/create-content-cluster` or an equivalent audit.

**Draft filenames:** $ARGUMENTS

If fewer or more than five filenames were supplied above, stop and ask for exactly
five draft filenames (for example `article-one.md`) before doing anything else.
Accept filenames separated by newlines, commas, or numbered list markers. Resolve
bare filenames under `src/content/articles/` when needed.

Do not run these steps out of order. Do not partially publish a failed batch. Do
not depend on prior conversation history; re-open and verify the five files every
time.

---

## Step 1 — Pre-publication verification

Before changing publication status:

- Open all five files
- Verify each exists under `src/content/articles/`
- Verify each is `draft: true` and `noindex: true`
- Verify all five passed a prior source and safety audit (sources present, scoped
  claims, safety language intact, no unresolved audit blockers)
- Verify `sources` are present and usable
- Verify `relatedArticles` slugs resolve
- Verify there are no unresolved TODOs, placeholders, or “TBD” content
- Verify `category`, `subcategory`, `slug`, `safetyLevel`, and target URL
- Verify there is no meaningful overlap that would make publication harmful
- Verify no unsupported or unsafe claim remains

If any article is not publication-ready:

1. Stop
2. Report the issue
3. Do **not** partially publish the batch
4. Do not change hubs, reciprocal links, or images for the batch

This command must not invent missing research or silently rewrite weak drafts into
publishable articles. Send the user back to drafting/audit when needed.

---

## Step 2 — Publish all five together

Only after all five pass Step 1, publish the whole batch.

For each article:

- Change `draft: true` to `draft: false`
- Change `noindex: true` to `noindex: false`
- Preserve `featured: false` until the image step is complete
- Preserve `affiliateDisclosure` unless explicitly instructed otherwise
- Preserve wording, sources, dates, slug, category, subcategory, `safetyLevel`,
  and canonical target

Do not rewrite audited article content during publication unless a technical error
is discovered (broken frontmatter, invalid schema value, broken internal path).

If a technical error blocks one article after status changes have begun, restore a
safe unpublished state for the batch or finish only after all five are corrected;
never leave a mixed published/unpublished cluster without telling the user.

---

## Step 3 — Update the relevant hub

Identify the correct category or specialized hub for the cluster.

Examples:

- `water-care`
- `maintenance`
- `troubleshooting`
- `buying-guides`
- `error-codes`
- Calculators only when applicable

Requirements:

- Replace empty-state or planned-topic copy when the section now has real content
- List only published content
- Do not create fake links
- Do not create empty category groups
- Preserve the existing TubWise design
- Do not redesign unrelated pages
- Add methodology or scope warnings only when appropriate to that section

### Error-code content

- Update brand/controller data only as required
- Generate only hubs containing published articles
- Do not create generic code diagnosis pages

### Buying guides

- Preserve compatibility-first methodology
- Do not add affiliate links, prices, Product schema, Review schema, or ranked
  product cards

If the five articles span more than one hub, update each affected hub carefully and
keep edits minimal.

---

## Step 4 — Add reciprocal internal links

Add brief reciprocal links from relevant existing published pages.

Requirements:

- Only add links where naturally useful
- Keep edits short
- Update `updatedDate` when published content is materially changed
- Do not imply a code, product, symptom, or purchase proves a diagnosis
- Do not add excessive links
- Do not rewrite unrelated paragraphs
- All links must resolve
- Prefer body links that preserve each page’s original search intent

Good opportunities often include related symptom, maintenance, water-care,
error-code, calculator, or buying-guide pages already connected by topic. Skip a
reciprocal link when it would feel forced or unsafe.

---

## Step 5 — Search validation

Confirm all five enter `search-index.json` after build.

Test sensible queries based on each article title and intent.

Each article should rank strongly for its exact title or primary search query.

Do not change search-ranking logic unless a genuine bug is found.

---

## Step 6 — Sitemap and routing validation

Confirm:

- All five routes build
- All five are indexable
- All five appear in the sitemap
- Canonical URLs are correct
- No duplicate routes exist
- No generic duplicate category route is generated
- No draft routes remain for these five
- No localhost URLs appear

Expected article URL shape is normally:

`/<category>/<slug>`

Error-code articles may use the specialized brand/code route when the live site
routing requires it. Follow current `articlePath` behavior.

---

## Step 7 — Featured images

Generate or select one distinct featured image for each article.

Before generating:

- Inspect existing assets in `public/images/articles/`
- Reuse an existing asset only when it genuinely matches and is not already used by
  another article
- Never reuse one image for multiple articles
- Reject misleading, unsafe, or unrelated images

Visual standard:

- Photorealistic editorial photography
- Residential hot-tub setting where appropriate
- Practical homeowner-resource feel
- Landscape composition targeting final 3:2 / 1200×800 output
- No identifiable people unless the article genuinely requires them
- No logos
- No readable fake product text
- No fake control-panel codes
- No fake certifications
- No watermarks
- No collage
- No luxury advertisement styling
- No exposed wiring or unsafe electrical work
- No unsafe chemical handling

### Buying guides

- Do not imply TubWise tested or endorsed a product
- Avoid recognizable product branding
- Avoid ranked-product compositions

### Error codes

- Avoid fabricated readable code displays
- Communicate the condition rather than inventing a branded panel

### Chemical content

- Closed containers
- No mixing or pouring unless the article specifically and safely requires it
- No bare-hand chemical handling

For every accepted image:

- Inspect it before integration
- Reject and regenerate unsafe or misleading output
- Resize to exactly 1200 × 800
- Convert to genuine WebP at quality 82
- Strip unnecessary metadata
- Save under `public/images/articles/`
- Remove temporary source files
- Use a descriptive filename
- Write accurate, concise alt text

Add frontmatter:

- `featuredImage`
- `featuredImageAlt`

Keep `featured: false` unless the user explicitly asks to feature the article.

Verify the image appears:

- Near the top of the article
- In absolute `og:image`
- In absolute `twitter:image`
- In BlogPosting structured data
- On cards only where the current component already supports it

Do **not** change shared card components solely to force image display.

---

## Step 8 — Final validation

Run:

```bash
npm run check
npm run build
```

Verify:

- All five article pages build
- All five appear in the sitemap
- All five appear in `search-index.json`
- All five have correct canonical URLs
- All `relatedArticles` slugs resolve
- Hub pages display correctly
- Reciprocal links resolve
- Images exist in `public` and `dist`
- Every image is 1200 × 800
- Visible image paths and alt text are correct
- `width="1200"` and `height="800"` are present
- Absolute `og:image` is correct
- Absolute `twitter:image` is correct
- BlogPosting image is correct
- No localhost URLs appear
- No `draft: true` or `noindex: true` remains on these five
- No unresolved placeholder or TODO text remains

For buying guides, also confirm:

- `affiliateDisclosure` remains as intended
- No affiliate links or prices were introduced
- No Product, Review, AggregateRating, or Offer schema was added

---

## Step 9 — Report and stop

Report:

- Final URLs
- Files changed
- Publication flags changed
- Hub updates
- Reciprocal internal links
- Search test results
- Sitemap confirmation
- Images reused
- Images generated
- Rejected or regenerated images
- Final image filenames
- Dimensions and file sizes
- Article-to-image mappings
- Alt text
- Metadata verification
- Check and build results
- Unresolved issues

### Hard stops for this command

Do **not**:

- Commit
- Push
- Deploy
- Submit URLs manually to Google Search Console
- Accept unpublished topics that were never drafted and audited
- Partially publish a failed five-article batch
- Add affiliate infrastructure, prices, or product/review schema unless the user
  explicitly requests that work in a separate instruction

### Closing line

End with:

> Publication workflow completed locally. Review the pages, then commit and push
> when approved.
