export interface SearchDocument {
  slug: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  categoryLabel: string;
  subcategory: string;
  tags: string[];
  href: string;
  body: string;
}

export interface SearchResult extends SearchDocument {
  score: number;
}

/** Suggested homepage topics that return published results. */
export const SEARCH_SUGGESTIONS = [
  'cloudy water',
  'not heating',
  'dirty filter',
  'weak jets',
] as const;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(query: string): string[] {
  return normalize(query)
    .split(' ')
    .filter((token) => token.length > 0);
}

/**
 * Case-insensitive ranked search over the build-time index.
 * Title matches rank highest; then description/summary/tags; body lowest.
 */
export function searchArticles(index: SearchDocument[], query: string): SearchResult[] {
  const phrase = normalize(query);
  if (!phrase) return [];

  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const results: SearchResult[] = [];

  for (const doc of index) {
    const title = normalize(doc.title);
    const description = normalize(doc.description);
    const summary = normalize(doc.summary);
    const tags = normalize(doc.tags.join(' '));
    const category = normalize(`${doc.category} ${doc.categoryLabel} ${doc.subcategory}`);
    const body = normalize(doc.body);
    const haystack = `${title} ${description} ${summary} ${tags} ${category} ${body}`;

    const allTokensPresent = tokens.every((token) => haystack.includes(token));
    if (!allTokensPresent) continue;

    // Prefer articles where most tokens match outside body text alone.
    const core = `${title} ${description} ${summary} ${tags} ${category}`;
    const coreHits = tokens.filter((token) => core.includes(token)).length;
    const minCoreHits = Math.max(1, Math.ceil(tokens.length * 0.75));
    if (coreHits < minCoreHits) continue;

    let score = 0;

    if (title === phrase) score += 100;
    else if (title.startsWith(phrase)) score += 70;
    else if (title.includes(phrase)) score += 60;

    for (const token of tokens) {
      if (title.includes(token)) score += 20;
      if (description.includes(token)) score += 8;
      if (summary.includes(token)) score += 8;
      if (tags.includes(token)) score += 10;
      if (category.includes(token)) score += 6;
      if (body.includes(token)) score += 2;
    }

    if (tokens.every((token) => title.includes(token))) score += 30;

    if (description.includes(phrase)) score += 15;
    if (summary.includes(phrase)) score += 15;
    if (tags.includes(phrase)) score += 12;

    // Prefer tighter title matches when the query phrase leads the title.
    if (title.startsWith(phrase)) {
      const remainder = title.slice(phrase.length).trim();
      score += Math.max(0, 24 - remainder.split(' ').filter(Boolean).length * 4);
    }

    if (score > 0) {
      results.push({ ...doc, score });
    }
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Autocomplete suggestions from the build-time index.
 * Requires at least 2 characters; returns up to `limit` title-weighted matches.
 */
export function suggestArticles(
  index: SearchDocument[],
  query: string,
  limit = 4,
): SearchResult[] {
  const phrase = normalize(query);
  if (phrase.length < 2) return [];
  return searchArticles(index, query).slice(0, limit);
}
