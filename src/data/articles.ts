/**
 * Homepage Popular Guides entries.
 * Published articles include href; unfinished placeholders omit href and show as coming soon.
 */
export interface GuidePlaceholder {
  title: string;
  description: string;
  category: string;
  readTime: string;
  featured?: boolean;
  /** When set, the card links to a live article instead of showing Coming soon. */
  href?: string;
}

export const homepageGuidePlaceholders: GuidePlaceholder[] = [
  {
    title: 'Hot Tub Not Heating: What to Check First',
    description:
      'Start with power, the GFCI, water level, filter condition, and any panel warning before calling a technician.',
    category: 'Troubleshooting',
    readTime: '6 min',
    featured: true,
    href: '/troubleshooting/hot-tub-not-heating',
  },
  {
    title: 'Why Is My Hot Tub Water Cloudy?',
    description:
      'A practical order of checks for dull or milky water — filtration, chemistry, and when to drain.',
    category: 'Water Care',
    readTime: '8 min',
    href: '/water-care/why-is-my-hot-tub-water-cloudy',
  },
  {
    title: 'How to Read Common Spa Error Codes',
    description: 'What panel messages often mean and when professional help is safer.',
    category: 'Error Codes',
    readTime: '7 min',
  },
  {
    title: 'Foamy Hot Tub Water: Causes and Fixes',
    description: 'Separate soap residue, chemistry issues, and filter problems.',
    category: 'Water Care',
    readTime: '6 min',
  },
  {
    title: 'Weekly Hot Tub Maintenance Checklist',
    description: 'A simple routine that keeps water clearer with less guesswork.',
    category: 'Maintenance',
    readTime: '4 min',
  },
];
