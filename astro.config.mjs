import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://calcbuild.online',
  output: 'static',
  integrations: [
    react(),
    tailwind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      filter: (page) => !page.includes('/404') && !page.includes('/blog'),
    }),
  ],
  redirects: {
    '/landscaping-calculators/siding-calculator/': '/siding-calculators/siding-calculator/',
    '/landscaping-calculators/siding-cost-calculator/': '/siding-calculators/siding-cost-calculator/',
    '/landscaping-calculators/siding-square-footage-calculator/': '/siding-calculators/siding-square-footage-calculator/',
  },
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
