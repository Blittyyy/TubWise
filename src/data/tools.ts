export interface ToolItem {
  title: string;
  description: string;
  href: string;
  status: 'available' | 'coming-soon';
}

export const tools: ToolItem[] = [
  {
    title: 'Hot Tub Volume Calculator',
    description: 'Estimate gallons so you can dose chemicals more accurately.',
    href: '/calculators',
    status: 'coming-soon',
  },
  {
    title: 'Electricity Cost Calculator',
    description: 'Get a rough sense of monthly heating and operating costs.',
    href: '/calculators',
    status: 'coming-soon',
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
