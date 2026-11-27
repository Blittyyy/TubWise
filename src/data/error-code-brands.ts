/**
 * Known spa controller / brand slugs for error-code hub pages.
 * Add entries as brand-specific error code content is published.
 */
export interface ErrorCodeBrandRelatedLink {
  label: string;
  href: string;
}

export interface ErrorCodeBrand {
  slug: string;
  name: string;
  description: string;
  /** Optional longer hub intro shown on /error-codes/{slug}. */
  hubIntro?: string[];
  /** Optional related troubleshooting links for the brand hub. */
  relatedLinks?: ErrorCodeBrandRelatedLink[];
}

export const errorCodeBrands: ErrorCodeBrand[] = [
  {
    slug: 'balboa',
    name: 'Balboa',
    description:
      'Guides for spas using Balboa Water Group control systems and topside panels. Displayed wording varies by panel family and software.',
    hubIntro: [
      'TubWise Balboa guides cover documented Balboa Water Group control-system behavior for selected messages and heat modes. They are not a complete catalog of every Balboa code, pack, or spa brand that installs a Balboa system.',
      'Identify your controller from the spa brand’s owner documentation and from safely visible equipment labels without opening electrical enclosures. Confirm the exact panel family (for example legacy ML-series text displays versus TP-series or Spa Touch screens) before matching a guide.',
      'The same condition can appear as a short LCD code such as Pr, dr, or drY on some panels, or as a longer descriptive message such as Priming Mode or The heater is dry on others. Firmware and spa-brand overlays can change wording. Always confirm the message in your own manual.',
    ],
    relatedLinks: [
      {
        label: 'Balboa Ready vs. Rest Mode',
        href: '/troubleshooting/balboa-ready-vs-rest-mode',
      },
      {
        label: 'How to Tell if a Hot Tub Has an Air Lock',
        href: '/troubleshooting/how-to-tell-if-a-hot-tub-has-an-air-lock',
      },
      {
        label: 'Hot Tub Not Heating After a Refill',
        href: '/troubleshooting/hot-tub-not-heating-after-a-refill',
      },
    ],
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
