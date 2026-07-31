import { getIndexableArticles, articlePath, categoryMeta } from './articles';
import type { ArticleCategory } from '../content.config';
import type { SearchDocument } from './search-rank';

export type { SearchDocument, SearchResult } from './search-rank';
export { SEARCH_SUGGESTIONS, searchArticles, suggestArticles } from './search-rank';

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ')
    .replace(/[*_~>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000);
}

export async function buildSearchIndex(): Promise<SearchDocument[]> {
  const articles = await getIndexableArticles();

  return articles.map((article) => {
    const category = article.data.category;
    return {
      slug: article.data.slug,
      title: article.data.title,
      description: article.data.description,
      summary: article.data.summary ?? '',
      category,
      categoryLabel: categoryMeta[category].label,
      subcategory: article.data.subcategory ?? '',
      tags: article.data.tags ?? [],
      href: articlePath(article),
      body: stripMarkdown(article.body ?? ''),
    };
  });
}

export function categorySuggestions(): { label: string; href: string; description: string }[] {
  return (['troubleshooting', 'water-care', 'maintenance', 'error-codes'] as ArticleCategory[]).map(
    (key) => ({
      label: categoryMeta[key].label,
      href: categoryMeta[key].href,
      description: categoryMeta[key].description,
    }),
  );
}
