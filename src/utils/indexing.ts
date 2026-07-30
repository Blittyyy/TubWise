import type { ArticleEntry } from './articles';

const PLACEHOLDER_PATTERN =
  /\[?\s*placeholder\s*\]?|research needed|to be researched|todo:|tbd\b/i;

/** Detect structural demo / unfinished article content. */
export function hasPlaceholderContent(article: ArticleEntry): boolean {
  if (article.body && PLACEHOLDER_PATTERN.test(article.body)) return true;
  if (PLACEHOLDER_PATTERN.test(article.data.description)) return true;
  if (article.data.summary && PLACEHOLDER_PATTERN.test(article.data.summary)) return true;

  if (
    article.data.sources.some(
      (source) =>
        PLACEHOLDER_PATTERN.test(source.title) ||
        (source.note && PLACEHOLDER_PATTERN.test(source.note)),
    )
  ) {
    return true;
  }

  if (
    article.data.faq.some(
      (item) =>
        PLACEHOLDER_PATTERN.test(item.question) || PLACEHOLDER_PATTERN.test(item.answer),
    )
  ) {
    return true;
  }

  return false;
}

/** Pages that should not appear in sitemaps or search indexes. */
export function isIndexableArticle(article: ArticleEntry): boolean {
  return !article.data.draft && !article.data.noindex && !hasPlaceholderContent(article);
}

export const NOINDEX_PATHS = new Set(['/404', '/calculators']);

export function isNoindexPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/$/, '') || '/';
  return NOINDEX_PATHS.has(normalized);
}
