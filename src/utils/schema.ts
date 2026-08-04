import { SITE_NAME, SITE_URL } from './site';
import { absoluteUrl } from './seo';
import {
  type ArticleEntry,
  articlePath,
  categoryMeta,
  toIsoDate,
} from './articles';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function categoryHubSchema(category: keyof typeof categoryMeta, path: string) {
  const meta = categoryMeta[category];
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.label,
    description: meta.description,
    url: absoluteUrl(path),
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function articleSchema(article: ArticleEntry) {
  const url = absoluteUrl(articlePath(article));
  const category = categoryMeta[article.data.category];
  const image = article.data.featuredImage
    ? absoluteUrl(article.data.featuredImage)
    : undefined;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.data.title,
    description: article.data.description,
    datePublished: toIsoDate(article.data.publishedDate),
    dateModified: toIsoDate(article.data.updatedDate ?? article.data.publishedDate),
    author: {
      '@type': 'Organization',
      name: article.data.author,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category.label,
    ...(article.data.tags.length > 0 ? { keywords: article.data.tags.join(', ') } : {}),
    ...(image ? { image } : {}),
  };

  return schema;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Practical guidance for hot tub owners: troubleshooting, error codes, water care, maintenance, and ownership tools.',
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Hot tub troubleshooting guides, error code explanations, water care tips, calculators, and buying guides.',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

export function webApplicationSchema(options: {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options.name,
    description: options.description,
    url: absoluteUrl(options.path),
    applicationCategory: options.applicationCategory ?? 'UtilitiesApplication',
    operatingSystem: 'Any',
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
