import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string(),
    navLabel: z.string().optional(),
    navOrder: z.number().optional(),
    updatedAt: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const legal = defineCollection({
  loader: glob({ base: './src/content/legal', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    heading: z.string().optional(),
    description: z.string(),
    effectiveAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    version: z.string(),
    toc: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pages, legal };
