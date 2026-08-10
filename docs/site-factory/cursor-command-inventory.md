# Cursor Command Inventory

Inventory of `.cursor/commands/` workflows in TubWise and how to carry them into a new niche site.

---

## Summary classification

| Command | Classification |
|---------|----------------|
| `create-content-cluster.md` | **Reusable with placeholders** |
| `publish-content-cluster.md` | **Reusable with placeholders** |
| `write-article-batch.md` | **Reusable with placeholders** |

None are safe to copy entirely unchanged without replacing niche categories, safety rules, source preferences, and brand names. None should be dropped — they encode the approval gates that kept quality high.

---

## 1. `create-content-cluster.md`

| | |
|--|--|
| **Filename** | `.cursor/commands/create-content-cluster.md` |
| **Purpose** | Turn exactly five proposed topics into researched, audited, **unpublished** drafts |
| **Inputs** | `$ARGUMENTS` — exactly five titles/topics |
| **Outputs** | Draft Markdown under `src/content/articles/`; completion/audit report |
| **Files it may change** | New files in `src/content/articles/` only (by design). Must **not** modify hubs, published articles, images, nav, or git state |
| **Stop conditions** | ≠5 topics; topic fails overlap/source/safety validation (no silent replace); user must approve replacements; hard stop on publish/images/hub edits/commit |
| **Validation** | `npm run check`, `npm run build`; confirm drafts absent from routes/sitemap/search-index |
| **Niche-specific portions** | Hot-tub categories/hubs; manufacturer-manual source list; TubWise safety rules; brand name; pointers to TubWise editorial docs |
| **Classification** | Reusable with placeholders |

**Replace before reuse:** site name, category examples, safety doctrine, source allow/deny lists, hub paths.

---

## 2. `publish-content-cluster.md`

| | |
|--|--|
| **Filename** | `.cursor/commands/publish-content-cluster.md` |
| **Purpose** | Publish exactly five audited drafts: flags, hubs, reciprocal links, featured images, validate |
| **Inputs** | `$ARGUMENTS` — exactly five draft filenames |
| **Outputs** | `draft`/`noindex` false; hub updates; reciprocal links; WebP images + frontmatter image fields; validation report |
| **Files it may change** | The five article files; relevant hub pages; existing articles for reciprocal links; `public/images/articles/*`; possibly niche data registries (e.g. error-code brands) |
| **Stop conditions** | ≠5 filenames; any article not publication-ready → **no partial publish**; no commit/push/deploy; no GSC submission inside command |
| **Validation** | `npm run check`, `npm run build`; sitemap + search-index membership; image dimensions/social/BlogPosting image; no localhost |
| **Niche-specific portions** | Hub list; URL shapes; error-code brand routes; buying-guide anti-affiliate/product-schema rules; hot-tub image safety constraints |
| **Classification** | Reusable with placeholders |

**Keep as-is philosophically:** all-or-nothing publish; no inventing research at publish time; images at publish not create time.

---

## 3. `write-article-batch.md`

| | |
|--|--|
| **Filename** | `.cursor/commands/write-article-batch.md` |
| **Purpose** | Draft 3–5 unpublished articles with lighter process than full cluster create |
| **Inputs** | `$ARGUMENTS` — 3–5 working titles (ask if empty) |
| **Outputs** | Draft Markdown files; report (paths, word counts, sources, skips, SERP structure notes) |
| **Files it may change** | New `src/content/articles/*.md` only; must not wire hubs/nav or publish |
| **Stop conditions** | No titles; skip titles failing risk/overlap/source screening; keep draft/noindex/featured false |
| **Validation** | `npm run check` then `npm run build` |
| **Niche-specific portions** | Embedded category/safety enums; editorial guidelines path; author string; hot-tub skip criteria |
| **Classification** | Reusable with placeholders |

**Relationship:** use for flexible drafting; use create+publish for strict five-article production with audit/image gates.

---

## Shared behaviors worth preserving

1. Re-inspect live schema every run — do not trust chat memory
2. Primary sources only for facts; SERP for structure only
3. Draft defaults unpublished
4. No commit/push/deploy inside commands
5. Skip or stop rather than invent

---

## What should not be carried forward unchanged

- Hot-tub safety examples as universal law
- TubWise category names
- Manufacturer lists as if every niche had the same vendors
- Hardcoded author `"TubWise Editorial Team"` without replacement
- Error-code publishing rules on sites without error-code IA
- Image rules that mention spa-specific visuals only — generalize carefully

---

## Recommended future commands (not in repo today)

Optional later — **recommendation**, not current automation:

- `audit-overlap` — inventory intents
- `check-internal-links` — built-route link checker
- Single-article publish (if batches are too rigid for the niche)

Do not claim these exist in TubWise.
