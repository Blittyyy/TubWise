# Design System

Reusable visual patterns from TubWise, with clear branding boundaries.

**Important:** TubWise colors, fonts, and wordmark are **brand choices**, not required defaults for a future site. Copy the *structure* (tokens, self-hosted fonts, layout primitives), then redesign the identity for `[SITE_NAME]`.

---

## Typography

**Current behavior (TubWise branding — change for new sites):**

| Role | Family | Token |
|------|--------|-------|
| Body / UI | Source Sans 3 | `--font-sans` |
| Display headings | Fraunces 600 | `--font-display` |

Weights self-hosted: 400, 400 italic, 500, 600, 700 for Source Sans 3; 600 for Fraunces.

**Reusable pattern:** expressive display + readable sans; avoid anonymous system-only stacks for branded marketing surfaces.

---

## Local font loading

**Current behavior:**

- `@font-face` rules in `src/styles/global.css`
- Files in `public/fonts/*.woff2` + OFL license text files
- `font-display: swap`
- Latin `unicode-range` subsetting
- `BaseLayout.astro` preloads `/fonts/source-sans-3-latin-400-normal.woff2`

**Do not** document or copy font binary contents into the starter docs. When extracting a starter, either re-license/self-host chosen fonts or swap families.

**Lesson:** self-hosting removed render-blocking Google Fonts requests (performance win without visible redesign).

---

## CSS variables (`@theme` in `global.css`)

TubWise tokens (illustrative of structure only — **not a mandated palette**):

| Token group | Examples |
|-------------|----------|
| Ink | `--color-ink`, `--color-ink-muted`, `--color-ink-subtle` |
| Surfaces | `--color-surface`, `--color-surface-raised`, `--color-sand` |
| Brand | `--color-brand`, `--color-brand-dark`, `--color-brand-soft`, `--color-accent` |
| Navy chrome | `--color-navy`, `--color-navy-soft` |
| Borders / warning | `--color-border`, `--color-warning-*` |

Forced light mode: `color-scheme: only light` with dark-preference overrides keeping light surfaces.

**Recommendation:** redefine tokens per brand. Avoid defaulting every new site to cream + teal simply because TubWise uses it.

---

## Spacing and layout primitives

Utility classes in `global.css`:

- `.container-site` — max width ~1180px
- `.section-space` — vertical section rhythm
- `.section-heading` / `.section-lede` — section intro pattern
- `.prose-site` / `.prose-article` — readable article prose

No shared `.card` / `.btn` CSS classes — components compose Tailwind utilities inline.

---

## Cards and buttons

**Pattern:**

- Cards: `rounded-2xl`, raised surface, light ring/border
- Primary CTA: brand background, white text, darker hover
- Secondary: bordered / sand background

Used in `ToolCard`, homepage sections, calculators, etc.

---

## Hubs and article layout

- Hubs: `CategoryArchive` + optional grouped lists
- Articles: summary box, safety callout, featured figure, prose, sources, FAQ, related
- Breadcrumbs above content

Preserve information hierarchy; restyle freely.

---

## Calculator layout

Bordered raised panel, segmented controls, inline errors, results block, educational prose below on the page.

---

## Mobile navigation

`Header.astro`:

- Desktop nav from `primaryNav`
- Mobile hamburger panel
- Search toggle panel with `SearchBar`
- Escape closes search; ARIA on toggles

Footer: brand blurb + categories + company + legal columns (`Footer.astro` + `navigation.ts`).

---

## Accessibility patterns

- Skip link to main content (`BaseLayout`)
- `:focus-visible` outline using brand color
- Button/menu `aria-expanded` patterns in header
- Calculator `aria-live` regions
- Images always have alt + dimensions

---

## Wordmark

`Wordmark.astro` splits the TubWise name with a brand-colored second half. **Fully niche branding** — replace for `[SITE_NAME]`.

---

## What to change vs keep

| Keep pattern | Change for new brand |
|--------------|----------------------|
| Tokenized Tailwind v4 `@theme` | Token values |
| Self-hosted fonts + preload | Font families/files |
| Container / section / prose classes | Copy tone inside |
| Light-only lock **if** brand needs it | Or support dark mode intentionally |
| Component-level Tailwind cards/buttons | Radii, colors, personality |
| Data-driven nav chrome | Labels and destinations |
