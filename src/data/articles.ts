/**
 * Homepage Popular Guides entries.
 * Only published articles with live hrefs should appear here.
 */
export interface GuidePlaceholder {
  title: string;
  description: string;
  category: string;
  readTime: string;
  featured?: boolean;
  href: string;
  image: string;
  imageAlt: string;
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
    image: '/images/articles/hot-tub-not-heating.webp',
    imageAlt: 'Residential hot tub owner checking the control panel',
  },
  {
    title: 'Why Is My Hot Tub Water Cloudy?',
    description:
      'Cloudy water can trace back to chemistry, sanitizer, filtration, or old water. Here is how to narrow it down.',
    category: 'Water Care',
    readTime: '8 min',
    href: '/water-care/why-is-my-hot-tub-water-cloudy',
    image: '/images/articles/cloudy-hot-tub-water.webp',
    imageAlt: 'Residential hot tub filled with cloudy water',
  },
  {
    title: 'Hot Tub Not Heating After a Refill',
    description:
      'No heat right after a refill often points to trapped air. Check water level, filters, and priming steps first.',
    category: 'Troubleshooting',
    readTime: '7 min',
    href: '/troubleshooting/hot-tub-not-heating-after-a-refill',
    image: '/images/articles/hot-tub-not-heating-after-refill.webp',
    imageAlt: 'Garden hose filling a residential hot tub after a refill',
  },
  {
    title: 'Can a Dirty Filter Make Hot Tub Water Cloudy?',
    description:
      'A dirty or clogged filter can leave water dull or milky. Learn how to check the filter safely.',
    category: 'Water Care',
    readTime: '7 min',
    href: '/water-care/can-a-dirty-filter-make-hot-tub-water-cloudy',
    image: '/images/articles/dirty-hot-tub-filter-cloudy-water.webp',
    imageAlt: 'Dirty and clean pleated hot tub filters shown side by side',
  },
  {
    title: 'Why Are My Hot Tub Jets Weak?',
    description:
      'Weak or surging jets often come down to low water, a dirty filter, or a closed valve.',
    category: 'Troubleshooting',
    readTime: '6 min',
    href: '/troubleshooting/why-are-my-hot-tub-jets-weak',
    image: '/images/articles/weak-hot-tub-jets.webp',
    imageAlt: 'Hot tub jets producing water flow in a residential spa',
  },
];
