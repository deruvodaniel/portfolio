import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({
    pattern: '**/*.json',
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\.json$/, '').replaceAll('/', '-'),
  }),
  schema: z.object({
    slug: z.string(),
    locale: z.enum(['en', 'es']),
    title: z.string(),
    tagline: z.string(),
    year: z.string().nullable(),
    role: z.string().nullable(),
    stack: z.array(z.string()),
    summary: z.string(),
    challenge: z.string().nullable(),
    process: z.array(z.string()),
    decisions: z.array(z.string()),
    outcomes: z.array(z.string()),
    links: z.object({ demo: z.string().url().nullable(), code: z.string().url().nullable() }),
    media: z.array(z.string()),
    caseStudyReady: z.boolean(),
    order: z.number(),
  }),
});

export const collections = { projects };
