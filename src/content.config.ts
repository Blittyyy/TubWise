import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const ARTICLE_CATEGORIES = [
  'troubleshooting',
  'water-care',
  'error-codes',
  'maintenance',
  'calculators',
  'buying-guides',
] as const;

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const SAFETY_LEVELS = [
  'none',
  'general',
  'chemical',
  'electrical',
  'professional',
] as const;

export type SafetyLevel = (typeof SAFETY_LEVELS)[number];

const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().optional(),
  publisher: z.string().optional(),
  accessed: z.string().optional(),
  note: z.string().optional(),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    /** Short answer or summary shown near the top of the article. */
    summary: z.string().optional(),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
        message: 'slug must be lowercase kebab-case',
      }),
    category: z.enum(ARTICLE_CATEGORIES),
    subcategory: z.string().optional(),
    brand: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    model: z.string().optional(),
    errorCode: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
      .optional(),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().min(1),
    reviewedBy: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
    draft: z.boolean().default(true),
    noindex: z.boolean().default(false),
    sources: z.array(sourceSchema).default([]),
    relatedArticles: z.array(z.string()).default([]),
    safetyLevel: z.enum(SAFETY_LEVELS).default('general'),
    /** Legacy optional fields retained for editorial workflow. */
    featured: z.boolean().default(false),
    affiliateDisclosure: z.boolean().default(false),
    faq: z
      .array(
        z.object({
          question: z.string().min(1),
          answer: z.string().min(1),
        }),
      )
      .default([]),
  }),
});

export const collections = { articles };
