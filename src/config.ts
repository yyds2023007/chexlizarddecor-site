import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string().max(200),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    amazon_url: z.string().url(),
    cover_image: z.string().default("/"),
    published: z.boolean().default(false),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { products };
