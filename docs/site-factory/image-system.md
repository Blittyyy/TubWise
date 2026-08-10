# Image System

Featured and social image conventions from TubWise publish workflow.

Do **not** store or embed generated niche image binaries in this documentation.

---

## Dimensions and format

| Setting | TubWise convention |
|---------|-------------------|
| Aspect | 3:2 |
| Pixel size | 1200×800 |
| Format | WebP |
| Quality | ~82 (publish command guidance) |
| Delivery path | `public/images/articles/<descriptive-name>.webp` |
| Public URL | `/images/articles/<descriptive-name>.webp` |

---

## Naming conventions

- Descriptive kebab-case matching topic, not random hashes
- Prefer stable names tied to slug intent
- One unique file per article (duplicate-image checks during publish)

---

## Frontmatter references

```yaml
featuredImage: /images/articles/example-topic.webp
featuredImageAlt: Descriptive alt text that explains the scene without stuffing keywords
```

Schema rule (`src/content.config.ts`): if `featuredImage` is set, `featuredImageAlt` is required.

---

## Alt text

- Describe the image contents accurately
- Do not stuff primary keywords
- Do not claim the photo shows a specific brand UI unless it does
- Avoid text-heavy images that embed fake error codes or instructions

---

## Social metadata

- `ArticleLayout` passes absolute featured image URL into OG/Twitter via `SeoHead`
- BlogPosting `image` set in `articleSchema` when featured image exists
- Fallback: `DEFAULT_OG_IMAGE` from `src/utils/site.ts`

---

## Rendering

`OptimizedImage.astro`:

- Requires `src`, `alt`, `width`, `height`
- Defaults: `loading="lazy"`, `decoding="async"`, responsive `sizes`
- Article featured image uses `loading="eager"` and `aspect-[3/2] object-cover`

**Current behavior note:** name says “Optimized” but there is no Astro Assets/srcset pipeline — files are pre-resized WebP in `public/`.

`ArticleCard` does **not** currently display featured images.

---

## Duplicate-image checks

Publish workflow requires unique images per article in the batch. Do not reuse one photo across multiple URLs.

---

## Temporary-file cleanup

When generating/converting images during publish, delete temp source files (PNG/JPG intermediates) so they are not left in the repo.

---

## Safety and accuracy review

Reject or regenerate images that:

- Depict unsafe procedures (energized work, improper chemical handling, etc.)
- Show fabricated device screens or error codes
- Mislead about brands/models
- Look like stock spam unrelated to the article

---

## Width/height requirements

Always set width and height on `<img>` to reduce CLS. Featured figure: 1200×800.

---

## Homepage / brand images

Separate from article featured images (e.g. hero/trust assets under `public/images/`). Treat as brand design, not editorial article media.
