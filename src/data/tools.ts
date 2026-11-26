export interface ToolItem {
  title: string;
  description: string;
  href: string;
  status: 'available' | 'coming-soon';
  /** Optional CTA label for available tools. Defaults to "Open tool". */
  ctaLabel?: string;
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
      'Estimate remaining water and fill time from capacity, fill level, and hose flow—enter a known rate or measure with a bucket.',
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
    title: 'Hot Tub Heat-Up Time Calculator',
    description:
      'Estimate heat-up time from water volume and heater power, or from your measured heating rate, with optional energy and cost.',
    href: '/calculators/hot-tub-heat-up-time-calculator',
    status: 'available',
  },
  {
    title: 'Hot Tub Weight Calculator',
    description:
      'Estimate empty, filled, and occupied spa weight from dry weight, water capacity, and people—with an optional footprint average.',
    href: '/calculators/hot-tub-weight-calculator',
    status: 'available',
  },
  {
    title: 'Error Codes',
    description:
      'Browse manufacturer-scoped hot tub error codes for Jacuzzi, Sundance, and Gecko, with safe next steps.',
    href: '/error-codes',
    status: 'available',
    ctaLabel: 'Browse error codes',
  },
  {
    title: 'Maintenance Schedule Generator',
    description: 'Create a simple care checklist based on how you use your spa.',
    href: '/calculators',
    status: 'coming-soon',
  },
];

export function hasAvailableTools(): boolean {
  return tools.some((tool) => tool.status === 'available');
}
