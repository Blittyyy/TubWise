// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://gettubwise.com',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => {
        const pathname = new URL(page).pathname.replace(/\/$/, '') || '/';
        const excluded = new Set(['/404', '/search']);
        return !excluded.has(pathname);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
