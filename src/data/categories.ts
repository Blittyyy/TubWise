export interface HelpCategory {
  title: string;
  description: string;
  href: string;
  /** Icon key used by HelpCategoryNav */
  icon?: HelpIcon;
}

export type HelpIcon =
  | 'water'
  | 'heat'
  | 'error'
  | 'leak'
  | 'filter'
  | 'schedule';

export const helpCategories: HelpCategory[] = [
  {
    title: 'Cloudy or Foamy Water',
    description: 'Clear up cloudy water, foam, and common chemistry imbalances.',
    href: '/water-care/why-is-my-hot-tub-water-cloudy',
    icon: 'water',
  },
  {
    title: 'Hot Tub Not Heating',
    description: 'Diagnose temperature issues, heaters, and related settings.',
    href: '/troubleshooting/hot-tub-not-heating',
    icon: 'heat',
  },
  {
    title: 'Error Codes',
    description: 'Look up what your spa panel message means and what to try next.',
    href: '/error-codes',
    icon: 'error',
  },
  {
    title: 'Leaks and Pumps',
    description: 'Track down leaks, pump noises, and circulation problems.',
    href: '/troubleshooting',
    icon: 'leak',
  },
  {
    title: 'Filters and Chemicals',
    description: 'Keep filtration and water care products working together.',
    href: '/water-care',
    icon: 'filter',
  },
  {
    title: 'Maintenance Schedule',
    description: 'Build a simple routine for weekly, monthly, and seasonal care.',
    href: '/maintenance',
    icon: 'schedule',
  },
];

export const browseTopics: HelpCategory[] = [
  {
    title: 'Troubleshooting',
    description: 'Step-by-step guides for common hot tub problems.',
    href: '/troubleshooting',
  },
  {
    title: 'Water Care',
    description: 'Chemistry, clarity, and balancing basics for homeowners.',
    href: '/water-care',
  },
  {
    title: 'Error Codes',
    description: 'Plain-language explanations of spa error messages.',
    href: '/error-codes',
  },
  {
    title: 'Maintenance',
    description: 'Routines that keep your spa cleaner and more reliable.',
    href: '/maintenance',
  },
  {
    title: 'Calculators',
    description: 'Estimate volume, electricity cost, and ownership planning.',
    href: '/calculators',
  },
  {
    title: 'Buying Guides',
    description: 'Find compatible supplies, parts, and replacement options.',
    href: '/buying-guides',
  },
];
