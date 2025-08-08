import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
	// Load Markdown and MDX files in the `src/content/posts/` directory.
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string().min(1, 'title is required'),
		description: z.string().min(1, 'description is required'),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		tags: z.array(z.string()).optional().default([]),
		featured: z.coerce.boolean().optional().default(false),
		featuredWeight: z.coerce.number().optional().default(0),
	}),
});

const quotes = defineCollection({
  type: 'data', // For JSON data files
  schema: z.array(
    z.object({
      text: z.string(),
      source: z.string(),
      url: z.string().url().optional(),
    })
	),
});

export const collections = { posts, quotes };
