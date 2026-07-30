/**
 * Known spa controller / brand slugs for error-code hub pages.
 * Add entries as brand-specific error code content is published.
 */
export interface ErrorCodeBrand {
  slug: string;
  name: string;
  description: string;
}

export const errorCodeBrands: ErrorCodeBrand[] = [
  {
    slug: 'balboa',
    name: 'Balboa',
    description:
      'Error codes for spas using Balboa control systems. Codes and meanings vary by panel and firmware.',
  },
  {
    slug: 'gecko',
    name: 'Gecko',
    description:
      'Error codes for spas using Gecko control systems. Always confirm the exact code shown on your panel.',
  },
];

export function getErrorCodeBrand(slug: string): ErrorCodeBrand | undefined {
  return errorCodeBrands.find((brand) => brand.slug === slug);
}
