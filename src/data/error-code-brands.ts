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
  {
    slug: 'jacuzzi',
    name: 'Jacuzzi',
    description:
      'Error codes for Jacuzzi spas vary by collection, control system, and owner\u2019s manual revision. Not every code applies to every Jacuzzi model. Confirm the exact display in your own manual before acting.',
  },
  {
    slug: 'sundance',
    name: 'Sundance',
    description:
      'Error codes for Sundance spas vary by series, equipment configuration, and owner\u2019s manual revision. Not every code applies to every Sundance model. Confirm the exact display in your own manual before acting.',
  },
];

export function getErrorCodeBrand(slug: string): ErrorCodeBrand | undefined {
  return errorCodeBrands.find((brand) => brand.slug === slug);
}
