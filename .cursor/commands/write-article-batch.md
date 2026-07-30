# Write Article Batch

Draft a batch of 3–5 new TubWise articles as **unpublished** Markdown files in
`src/content/articles/`, following TubWise's editorial and technical standards.

**Batch titles:** $ARGUMENTS

If no titles were supplied above, ask the user for 3–5 working titles before doing
anything else. Accept titles separated by newlines, commas, or numbered list markers.

Do not run this command's steps out of order. Do not skip the inspection or risk-screening
steps, even if the titles look simple.

## Step 1 — Inspect the content schema

Read `src/content.config.ts` and confirm the current constraints before drafting anything:

- `category` must be one of the `ARTICLE_CATEGORIES` enum values (currently
  `troubleshooting`, `water-care`, `error-codes`, `maintenance`, `calculators`,
  `buying-guides`).
- `safetyLevel` must be one of the `SAFETY_LEVELS` enum values (currently `none`,
  `general`, `chemical`, `electrical`, `professional`) — never invent a value like
  `"high"`.
- `slug` must be lowercase kebab-case and match the collection's regex.
- `sources` is an array of `{ title, url?, publisher?, accessed?, note? }`.
- `relatedArticles` is an array of article **slugs** (strings), not titles or paths.
- `tags`, `faq`, `sources`, `relatedArticles` all default to `[]` if omitted, but include
  them explicitly for clarity.
- Required fields with no default: `title`, `description`, `slug`, `category`,
  `publishedDate`, `author`.

If the schema has changed since this command was written, follow the live schema, not the
example below.

## Step 2 — Inspect existing articles

List every file in `src/content/articles/` and read their frontmatter (`title`, `slug`,
`category`, `subcategory`, `draft`, `noindex`, `tags`). Build a short mental map of:

- Which slugs already exist (new slugs must not collide).
- Which topics/search intents are already covered, including **published** articles
  (`draft: false`) that new articles could link to, and **placeholder/draft** articles
  that should not be treated as reliable sources of fact.

Currently published (safe to link to in body copy): check each article's `draft` value
directly rather than assuming — do not link to an article that is still `draft: true`.

## Step 3 — Build a shared source pack

For the batch as a whole, gather 2–4 credible sources per article, preferring:

- Manufacturer owner's manuals (PDF or hosted manual pages)
- Manufacturer support/troubleshooting pages
- Government or established industry safety guidance

For every candidate source, record:

- Exact title, publisher, URL
- Access date (today)
- What model/product line/date range it actually covers (do not assume it applies more
  broadly than stated)
- The exact claim(s) it supports

Only use a source if you can point to the specific passage supporting the claim you want
to make. Do not fabricate a citation to fill a gap — narrow or drop the claim instead.

## Step 4 — Risk and overlap screening

Before drafting, evaluate each supplied title against these skip criteria. **Skip and
report** (do not draft) any title that:

- Cannot be supported by 2–4 credible sources found in Step 3
- Requires content Editorial Guidelines forbid for a homeowner article: electrical
  testing/wiring work, control-box access, safety-device bypassing, gas line or gas
  appliance repair, structural/shell repair, or unverified chemical dosing formulas
- Would require inventing statistics, test results, or firsthand experience to be
  useful
- Duplicates the search intent of another title in this batch, or of an existing
  article (published or draft) — if two titles overlap, keep the more specific/useful
  one and skip the other, explaining why

For titles that pass, note any part of the requested topic that must be narrowed or
left out because the sources don't support it.

## Step 5 — Draft each remaining article

Create one file per remaining title at `src/content/articles/<slug>.md`. Follow
`docs/editorial-guidelines.md` in full. In particular:

**Frontmatter** (adapt values; keep every field the schema expects):

```yaml
---
title: "<Article title>"
description: "<Natural, unique description under 160 characters>"
summary: "<1-3 sentence direct answer, matching the article's opening>"
slug: "<lowercase-kebab-case>"
publishedDate: <YYYY-MM-DD, today>
updatedDate: <YYYY-MM-DD, today>
category: "<valid category>"
subcategory: "<short topic label>"
tags:
  - <relevant tag>
  - <relevant tag>
author: "TubWise Editorial Team"
draft: true
noindex: true
featured: false
affiliateDisclosure: false
safetyLevel: "<valid safety level>"
relatedArticles:
  - <slug of a genuinely related article in this batch, if any>
sources:
  - title: "<exact source title>"
    url: "<url>"
    publisher: "<publisher>"
    accessed: "<YYYY-MM-DD>"
    note: "<what it covers / scope limits / revision info>"
faq: []
---
```

**Body** — 700–900 words, homeowner-friendly, using this structure:

1. Direct answer (2–3 sentences, no heading needed or a short "Direct answer" H2)
2. Short safety note if `safetyLevel` is not `none`
3. Short sections with descriptive H2/H3 headings covering the most likely
   causes/considerations, each attributed to its source
4. "Safe checks the homeowner can do" — a short ordered list, safe actions only
5. "When to stop and call a technician" (or equivalent stop conditions) where the
   topic carries any real risk
6. A natural inline link to a genuinely related **published** TubWise article, if one
   exists (e.g. `[Hot Tub Not Heating: What to Check First](/troubleshooting/hot-tub-not-heating)`)
7. Do not add a visible "Sources" section unless the existing published articles in
   this repo already do so consistently — check current convention first and match it

Writing rules (from the editorial guidelines — do not violate these):

- No invented facts, statistics, quotes, credentials, or firsthand testing claims
- No electrical testing, wiring, control-box access, or safety-device bypassing
- No unsupported chemical dosing instructions
- Present causes as possibilities, not confirmed diagnoses, unless the source says
  otherwise
- Attribute brand/model-specific claims explicitly (e.g. "Hot Spring documents...",
  "A Jacuzzi manual for the J-300 series states...") and never generalize a
  brand-specific fact to "all hot tubs"
- Avoid every phrase listed in the guidelines' "Phrases to avoid" section
- Plain, calm, professional tone; short paragraphs; define jargon on first use

## Step 6 — Validate

Run, in order, stopping to fix any errors before moving on:

```bash
npm run check
npm run build
```

Fix schema violations, TypeScript errors, or broken internal links yourself before
reporting completion. Do not weaken a factual claim to make the build pass — fix
formatting/schema issues only.

## Step 7 — Report

Do not change `draft`, `noindex`, or `featured` away from their required values
(`true`, `true`, `false`). Do not link these new articles from any existing page,
nav, or category listing — this command only creates draft content files.

Report back with:

- One line per file created: path, final word count, category/subcategory
- Sources used per article (title + publisher)
- Any claims that were narrowed, qualified, or left out because sources didn't
  support the original request
- Any titles skipped in Step 4, with the specific reason
- Confirmation that `npm run check` and `npm run build` both passed
