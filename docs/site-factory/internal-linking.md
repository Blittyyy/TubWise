# Internal Linking

Standards for hubs, related articles, contextual links, and calculator cross-links.

---

## Link types

### Category hub links

- Primary nav (`src/data/navigation.ts`) points at each hub
- Homepage/help cards (`src/data/categories.ts`) may deep-link into hubs
- Hubs list **indexable** articles only

### Subcategory groupings

- Editorial `subcategory` frontmatter values
- Hub pages group articles under headings (hand-maintained maps in hub Astro files)
- Keep subcategory strings consistent to avoid orphans inside hubs

### `relatedArticles`

- Frontmatter array of **slugs**
- Resolved by `getRelatedArticles` against the indexable article map
- Skips self; skips missing/draft slugs silently from the UI list
- Rendered by `RelatedArticles.astro` near article end

### Contextual body links

- Markdown links inside article bodies to other published URLs
- Prefer linking when the reader’s next question is a different intent
- Only link to published (`draft: false`) articles

### Reciprocal links

- Added during `publish-content-cluster` from existing published pages back to new cluster URLs
- Must be brief and naturally useful
- Do not spray the same new URL across unrelated articles

### Calculator → article links

- Calculator pages include related `ArticleCard`s / educational links to guides that explain inputs or next steps

### Article → calculator links

- Articles may link to tools when a calculation genuinely helps (volume, cost, fill time in TubWise)
- Do not shoehorn calculator CTAs into every article

---

## Orphan detection

**Recommendation (process — not a dedicated automated script in TubWise today):**

After each cluster publish:

1. Confirm each new URL appears on its category hub
2. Confirm at least one contextual or reciprocal inbound link from a relevant published page **or** strong hub placement with relatedArticles
3. Confirm homepage curated lists are updated only when intentionally featuring content (`src/data/articles.ts` is manual)

Hub auto-listing reduces true orphans for categorized articles; still check specialty routes (e.g. error-code brand pages).

---

## Broken-link testing

**Current behavior:** no dedicated link-crawler script in `package.json`.

Practical checks used in workflow:

- `npm run build` fails on many schema/path issues
- Manually verify `relatedArticles` slugs resolve before publish
- Spot-check reciprocal anchors after edits
- Preview critical hubs and new articles

**Recommendation for a future starter:** add a lightweight script that extracts internal hrefs from built HTML and checks them against known routes — optional enhancement, not present now.

---

## Avoiding forced links

Do not add a link when:

- The target does not change the reader’s next action
- The only motive is PageRank sculpting
- The anchor would compete with the target’s primary query
- The pages are near-duplicates

Dropping a weak reciprocal link is better than forcing one.

---

## Avoiding cannibalization through poor anchor text

| Bad pattern | Better pattern |
|-------------|----------------|
| Every link uses the exact primary keyword of the target | Descriptive anchors that match the **relationship** (“if jets weaken when you open more seats…”) |
| Two articles rank for the same head term and cross-link with identical anchors | Differentiate intents; link as parent/child or sibling symptoms |
| Hub cards and body links all say the same phrase | Vary anchors; keep titles distinct |

---

## Recommended linking standard for new sites

1. **Every published article** belongs to exactly one primary category hub.
2. **Every published article** has 2–5 `relatedArticles` slugs when siblings exist; fewer is fine for early seed content.
3. **Body links** only for distinct intents or prerequisite concepts.
4. **Reciprocal links** only from pages a human would naturally navigate between.
5. **Tools** link to 2–4 educational articles; articles link to tools only when calculation helps.
6. **Never** link to drafts, placeholders, or `noindex` URLs intended to stay private.
7. **Never** invent hub entries for unpublished topics.
8. Re-audit internal links after any slug change (add redirects if URLs change post-launch).

---

## TubWise implementation map

| Concern | Location |
|---------|----------|
| `articlePath` / breadcrumbs | `src/utils/articles.ts` |
| Related resolution | `getRelatedArticles` |
| Hub listings | `src/pages/[CATEGORY]/index.astro` + `CategoryArchive.astro` |
| Nav | `src/data/navigation.ts` |
| Homepage guides | `src/data/articles.ts` (manual) |
| Tool registry links | `src/data/tools.ts` |
