export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: 'Troubleshooting', href: '/troubleshooting' },
  { label: 'Water Care', href: '/water-care' },
  { label: 'Error Codes', href: '/error-codes' },
  { label: 'Maintenance', href: '/maintenance' },
  { label: 'Calculators', href: '/calculators' },
  { label: 'Buying Guides', href: '/buying-guides' },
];

export const footerLegal: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
  { label: 'Disclaimer', href: '/disclaimer' },
];
