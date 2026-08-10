# Lessons Learned

Concrete lessons from building and auditing TubWise. Apply these to the next niche site.

---

## Content and IA

### Validate overlap before drafting

The cost of a bad URL is higher than the cost of rejecting a topic. Overlap checks against published **and** draft articles prevented thin duplicates (e.g. noise/vibration cluster candidates that collided with existing pump-noise intent).

### Article count is not the same as total page count

Hubs, legal pages, calculators, search, brand index pages, and articles all count as pages. Conversational estimates confuse “articles published” with “HTML pages built.” Prefer repository counts (`src/content/articles` with `draft: false`, `dist/**/*.html`, sitemap URL counts).

### Narrow symptoms can become thin duplicate pages

A slightly reworded symptom (“rattle when jets on” vs “noise when jets on”) may not deserve a separate URL if unique value is thin. Pre-publish audits should reject padding.

### A failed topic should be dropped rather than padded

When validation fails, stop. Propose replacements; require approval. Do not invent content to preserve a batch size.

### Primary-source scope matters

A manual for one brand/controller does not authorize universal claims. Scope every claim; say when guidance varies.

### Do not universalize manufacturer behavior

Error codes, heating logic, and panel behavior differ. TubWise isolates error codes under brand paths for this reason. New sites should not flatten brand-specific facts into generic advice.

---

## Differentiation and linking

### Calculators improve differentiation

Pure client-side tools with tests and honest caveats create utility beyond another article. Only ship when accurate and safe.

### Internal links should be selective

Forced reciprocal links and identical anchors create cannibalization risk. Link when reader intent progresses; skip when it does not.

---

## Technical SEO and measurement

### Technical SEO can be correct even before traffic arrives

Sound canonicals, draft gates, sitemap filters, and schema can be in place while impressions are still zero.

### Search Console reporting can lag

Absence of early query data is not automatic proof of a broken setup. Verify with URL inspection and sitemap status before rewriting architecture.

### PageSpeed suggestions are not automatically required fixes

Treat lab suggestions as hypotheses. Prefer high-value changes (e.g. self-hosting fonts to remove render-blocking third-party CSS) over cosmetic churn.

### Invisible performance improvements can still be valuable

Font self-hosting did not change the visual brand but removed external font request waterfalls.

### Repository counts beat conversational estimates

When reporting progress, count files and build artifacts. Do not rely on chat summaries of “how many articles we have.”

---

## Process

### Separate create and publish

Draft+audit without images/hubs first; publish as an all-or-nothing batch later. This preserved a manual approval gate.

### Default `draft: true`

Safe schema default prevented accidental publishing of incomplete frontmatter.

### Placeholder detection is a feature

Strings like `TBD` / `placeholder` blocking indexability caught unfinished content better than honor-system alone.

### Do not automate commit/deploy inside content commands

Human control over git and production reduces accidental launches of unfinished clusters.

### Avoid unsupported rich results

No fake Offers, ratings, or reviews. Duplicate JSON-LD + microdata is a self-inflicted audit finding.

---

## Documentation meta-lesson

When extracting a starter later, copy systems and gates — not hot-tub claims, TubWise palette-as-default, or brand-specific safety copy verbatim.
