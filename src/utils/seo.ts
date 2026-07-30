import { SITE_NAME, SITE_URL } from './site';

export interface PageSeo {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  ogImage?: string;
}

export function absoluteUrl(path = '/'): string {
  if (path.startsWith('http')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  // Always emit canonical URLs without trailing slashes (except root).
  const trimmed = normalized === '/' ? '/' : normalized.replace(/\/$/, '');
  return `${SITE_URL}${trimmed}`;
}

export function buildTitle(title: string, includeBrand = true): string {
  if (!includeBrand || title === SITE_NAME) return title;
  if (title.includes(SITE_NAME)) return title;
  return `${title} | ${SITE_NAME}`;
}

export function normalizePath(pathname: string): string {
  const lower = pathname.toLowerCase();
  return lower === '/' ? '/' : lower.replace(/\/$/, '');
}
