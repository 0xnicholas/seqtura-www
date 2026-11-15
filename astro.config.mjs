import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://seqtura.ai',
  trailingSlash: 'never',
  output: 'static',
  adapter: node({ mode: 'middleware' }),
  session: false,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/404'),
    }),
  ],
  vite: {
    build: {
      // Keep every runtime script external so the strict CSP can stay `script-src 'self'`.
      assetsInlineLimit: 0,
    },
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['zod'],
    },
    environments: {
      prerender: {
        resolve: {
          noExternal: ['zod'],
        },
      },
    },
  },
});
