# TubWise

Hot tub problems, solved.

Production site: https://gettubwise.com

## Stack

- Astro (static)
- TypeScript
- Tailwind CSS
- Content collections (Markdown/MDX)

## Commands

| Command | Action |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start local dev server |
| `astro dev --background` | Start backgrounded Astro server (preferred in this workspace) |
| `astro dev stop` | Stop background server |
| `astro dev status` | Check background server status |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview the production build |
| `npm run check` | Run Astro/TypeScript checks |

## Content

Articles live in `src/content/articles/` as Markdown with frontmatter validated by `src/content.config.ts`.

- URL pattern: `/{category}/{slug}`
- Category archives auto-list published articles
- Set `draft: false` to publish
- FAQ JSON-LD is emitted only when FAQ answers are not placeholders

```sh
npm run check   # validates types + content schema usage
npm run build
```
