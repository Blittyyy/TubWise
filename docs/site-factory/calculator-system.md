# Calculator System

Reusable architecture for client-side utilities, separated from niche formulas.

---

## Pure utility architecture

**Pattern (current TubWise):**

```text
src/utils/[tool-name].ts     → pure calculate + validate (+ unit helpers)
scripts/test-[tool-name].mjs → node --experimental-strip-types tests
src/components/[Tool].astro  → markup + client <script> importing utils
src/pages/calculators/…      → educational page shell + schema + related articles
src/data/tools.ts            → hub registry (available | coming-soon)
```

Result shape used across tools:

```ts
{ ok: true, result } | { ok: false, errors: { field: string, message: string }[] }
```

**Privacy boundary (TubWise):** calculator headers state that inputs are not stored, cookied, or sent to a server. Keep that promise unless you intentionally add persistence and update privacy policy.

---

## Astro calculator component pattern

Shared UI behaviors observed in `HotTubVolumeCalculator.astro`, `HotTubFillTimeCalculator.astro`, `HotTubElectricityCostCalculator.astro`:

- Root element with `data-*` hook for the script
- Radio / field cards with visible selection states
- Per-field error nodes (`data-error-for`)
- Results region with `aria-live="polite"`
- Reset control restoring defaults
- Accuracy / limitation callouts in the component or page prose

Scripts run in the browser only; utils are imported into the client script.

---

## Client-side-only behavior

- No backend API for calculation
- No auth
- Unit conversion handled in utils
- Page can still be prerendered as static HTML; interactivity hydrates via inline module script

---

## Validation, units, accessibility, reset, aria-live

| Concern | Expectation |
|---------|-------------|
| Validation | Required fields, numeric bounds, mutually exclusive modes |
| Units | Explicit unit selectors; convert to a base unit inside utils |
| Accessibility | Label associations, focusable controls, error text tied to fields, live regions for results |
| Reset | Clears errors and restores initial mode/values |
| aria-live | Polite updates when results change |

---

## Test scripts

**Current behavior (`package.json`):**

```text
test:calculators → test:volume && test:fill-time && test:electricity-cost
```

Each script: `node --experimental-strip-types scripts/test-hot-tub-*.mjs`

**Recommendation:** keep pure functions fully unit-tested; do not rely on manual UI clicking for formula correctness.

---

## Schema and hub cards

- Calculator pages attach `webApplicationSchema({ name, description, path })`
- Hub: `src/pages/calculators/index.astro` uses `CategoryArchive` + `ToolCard` grid from `tools`
- `hasAvailableTools()` can drive hub `noindex` when nothing is available

Do **not** add Offer/price schema to free utilities unless true and approved.

---

## Educational page content

Each tool page should include:

- What the tool estimates
- What it does **not** estimate
- Input definitions
- Worked mental model / formula explanation at a safe level
- Links to related guides
- Safety/accuracy caveats

---

## TubWise tools (niche formulas — do not copy as generic defaults)

| Tool | Util | Notes |
|------|------|-------|
| Volume | `src/utils/hot-tub-volume.ts` | Rectangular/round geometry |
| Fill time | `src/utils/hot-tub-fill-time.ts` | Capacity × remaining ÷ flow |
| Electricity cost | `src/utils/hot-tub-electricity-cost.ts` | Heater/pump/optional loads |

These formulas and spa-specific accuracy notices are **niche content**.

---

## Checklist: should this calculator be indexed?

Use all of the following:

| Question | Fail means |
|----------|------------|
| **Useful?** Does it change a decision or save meaningful effort? | Skip or keep as non-indexed experiment |
| **Accurate?** Are formulas correct within stated assumptions? | Do not ship |
| **Safe?** Can misuse cause harm if caveats are weak? | Add hard stops or do not ship |
| **Supportable?** Can primary sources or standard math justify the method? | Do not invent precision |
| **Distinct?** Is it different from existing tools/articles? | Merge or drop |
| **Private?** Are data practices disclosed? | Update privacy or avoid collection |

---

## Reusable vs niche

| Reusable | Niche-specific |
|----------|----------------|
| util → component → page → registry → tests | Domain formulas |
| ok/errors API | Device labels and presets |
| client-only compute | Spa accuracy notices |
| WebApplication schema | Cross-links to hot-tub articles |
| a11y + aria-live pattern | Tool names and marketing copy |
