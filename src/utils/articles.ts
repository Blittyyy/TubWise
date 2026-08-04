import { getCollection, type CollectionEntry } from 'astro:content';
import type { ArticleCategory, SafetyLevel } from '../content.config';
import { errorCodeBrands } from '../data/error-code-brands';
import { isIndexableArticle } from './indexing';

export type ArticleEntry = CollectionEntry<'articles'>;

export const categoryMeta: Record<
  ArticleCategory,
  { label: string; description: string; href: string }
> = {
  troubleshooting: {
    label: 'Troubleshooting',
    description:
      'Step-by-step hot tub troubleshooting guides for heating issues, leaks, pumps, and other common problems.',
    href: '/troubleshooting',
  },
  'water-care': {
    label: 'Water Care',
    description:
      'Practical water care guidance for clear, balanced hot tub water — chemistry basics, cloudy water, foam, and filter care.',
    href: '/water-care',
  },
  'error-codes': {
    label: 'Error Codes',
    description:
      'Look up hot tub and spa error codes in plain language, with safe next steps and guidance on when to call a technician.',
    href: '/error-codes',
  },
  maintenance: {
    label: 'Maintenance',
    description:
      'Simple hot tub maintenance schedules and checklists for weekly, monthly, and seasonal spa care.',
    href: '/maintenance',
  },
  calculators: {
    label: 'Calculators',
    description:
      'Estimate hot tub volume, fill time, and electricity cost with simple ownership planning tools.',
    href: '/calculators',
  },
  'buying-guides': {
    label: 'Buying Guides',
    description:
      'Homeowner-friendly buying guides for hot tub filters, chemicals, parts, and compatible replacement supplies.',
    href: '/buying-guides',
  },
};

/** True when an error-code article should use /error-codes/{brand}/{code}. */
export function isErrorCodeArticle(article: {
  data: Pick<ArticleEntry['data'], 'category' | 'brand' | 'errorCode'>;
}): boolean {
  return (
    article.data.category === 'error-codes' &&
    Boolean(article.data.brand) &&
    Boolean(article.data.errorCode)
  );
}

export function errorCodePath(brand: string, code: string): string {
  return `/error-codes/${brand.toLowerCase()}/${code.toLowerCase()}`;
}

/** Canonical public URL for an article — one preferred URL per piece of content. */
export function articlePath(
  article: ArticleEntry | { data: { category: ArticleCategory; slug: string; brand?: string; errorCode?: string } },
): string {
  if (isErrorCodeArticle(article)) {
    return errorCodePath(article.data.brand!, article.data.errorCode!);
  }
  return `/${article.data.category}/${article.data.slug}`;
}

export function isPublished(article: ArticleEntry, { includeDrafts = false } = {}): boolean {
  return includeDrafts || !article.data.draft;
}

export async function getAllArticles({
  includeDrafts = false,
  includeNoindex = false,
}: {
  includeDrafts?: boolean;
  includeNoindex?: boolean;
} = {}): Promise<ArticleEntry[]> {
  const articles = await getCollection('articles');
  return articles
    .filter((article) => {
      if (!includeDrafts && article.data.draft) return false;
      if (!includeNoindex && article.data.noindex) return false;
      return true;
    })
    .sort((a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf());
}

export async function getIndexableArticles(): Promise<ArticleEntry[]> {
  const articles = await getCollection('articles');
  return articles.filter(isIndexableArticle).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );
}

export async function getArticlesByCategory(
  category: ArticleCategory,
): Promise<ArticleEntry[]> {
  const articles = await getIndexableArticles();
  return articles.filter((article) => article.data.category === category);
}

export async function getBrandsWithArticles() {
  const articles = await getIndexableArticles();
  const brandSlugs = new Set(
    articles
      .filter(isErrorCodeArticle)
      .map((article) => article.data.brand!.toLowerCase()),
  );
  return errorCodeBrands.filter((brand) => brandSlugs.has(brand.slug));
}

export async function getArticlesByBrand(brandSlug: string): Promise<ArticleEntry[]> {
  const articles = await getIndexableArticles();
  return articles.filter(
    (article) =>
      article.data.category === 'error-codes' &&
      article.data.brand?.toLowerCase() === brandSlug.toLowerCase(),
  );
}

export async function getErrorCodeArticle(
  brandSlug: string,
  codeSlug: string,
): Promise<ArticleEntry | undefined> {
  const articles = await getIndexableArticles();
  return articles.find(
    (article) =>
      isErrorCodeArticle(article) &&
      article.data.brand?.toLowerCase() === brandSlug.toLowerCase() &&
      article.data.errorCode?.toLowerCase() === codeSlug.toLowerCase(),
  );
}

export async function getFeaturedArticles(limit = 6): Promise<ArticleEntry[]> {
  const articles = await getIndexableArticles();
  const featured = articles.filter((article) => article.data.featured);
  const pool = featured.length > 0 ? featured : articles;
  return pool.slice(0, limit);
}

export async function getRelatedArticles(article: ArticleEntry): Promise<ArticleEntry[]> {
  if (article.data.relatedArticles.length === 0) return [];

  const all = await getIndexableArticles();
  const bySlug = new Map(all.map((entry) => [entry.data.slug, entry]));

  return article.data.relatedArticles
    .map((slug) => bySlug.get(slug))
    .filter((entry): entry is ArticleEntry => entry !== undefined && entry.id !== article.id);
}

export function articleBreadcrumbs(article: ArticleEntry): { label: string; href?: string }[] {
  const category = categoryMeta[article.data.category];
  const crumbs: { label: string; href?: string }[] = [
    { label: 'Home', href: '/' },
    { label: category.label, href: category.href },
  ];

  if (isErrorCodeArticle(article)) {
    crumbs.push({
      label: article.data.brand!,
      href: `/error-codes/${article.data.brand}`,
    });
  }

  crumbs.push({ label: article.data.title });
  return crumbs;
}

export function formatArticleDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function toIsoDate(date: Date): string {
  return date.toISOString();
}

export function getValidFaq(article: ArticleEntry): { question: string; answer: string }[] {
  return article.data.faq.filter((item) => {
    const answer = item.answer.trim();
    const question = item.question.trim();
    if (!question || !answer) return false;
    const placeholderPattern =
      /\[?\s*placeholder\s*\]?|research needed|to be researched|todo:|tbd\b/i;
    return !placeholderPattern.test(answer) && !placeholderPattern.test(question);
  });
}

export function safetyCopy(level: SafetyLevel): { title: string; body: string } | null {
  switch (level) {
    case 'none':
      return null;
    case 'chemical':
      return {
        title: 'Chemical safety',
        body: 'Follow product labels and your spa manufacturer instructions. Never mix chemicals casually, and keep children and pets away while dosing. If you are unsure about a product or reaction, stop and get professional guidance.',
      };
    case 'electrical':
      return {
        title: 'Electrical safety',
        body: 'Do not open electrical compartments or attempt wiring work unless you are qualified. Repeated breaker trips, burning smells, or scorched components need a licensed technician.',
      };
    case 'professional':
      return {
        title: 'Professional service recommended',
        body: 'This topic can involve risks beyond a typical homeowner check. Use this page for orientation only, then contact a qualified hot tub technician when the issue involves safety, structure, or specialized equipment.',
      };
    case 'general':
    default:
      return {
        title: 'When to call a professional',
        body: 'TubWise offers practical homeowner guidance. Stop and contact a qualified technician for electrical work, structural damage, gas equipment, persistent leaks, or any situation that could affect safety.',
      };
  }
}
