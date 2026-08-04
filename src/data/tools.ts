export interface ToolItem {
  title: string;
  description: string;
  href: string;
  status: 'available' | 'coming-soon';
}

export const tools: ToolItem[] = [
  {
    title: 'Hot Tub Volume Calculator',
    description:
      'Estimate your spa\'s capacity in gallons and liters using its shape and interior water dimensions.',
    href: '/calculators/hot-tub-volume-calculator',
    status: 'available',
  },
  {
    title: 'Hot Tub Fill Time Calculator',
    description:
      'Estimate remaining water and how long a fill may take from capacity, fill level, and hose flow rate.',
    href: '/calculators/hot-tub-fill-time-calculator',
    status: 'available',
  },
  {
    title: 'Hot Tub Electricity Cost Calculator',
    description:
      'Estimate electricity use and operating cost from equipment wattage, daily runtime, and your utility rate.',
    href: '/calculators/hot-tub-electricity-cost-calculator',
    status: 'available',
  },
  {
    title: 'Maintenance Schedule Generator',
    description: 'Create a simple care checklist based on how you use your spa.',
    href: '/calculators',
    status: 'coming-soon',
  },
  {
    title: 'Error Code Lookup',
    description: 'Search brand and model error codes for next steps.',
    href: '/error-codes',
    status: 'coming-soon',
  },
];

export function hasAvailableTools(): boolean {
  return tools.some((tool) => tool.status === 'available');
}
