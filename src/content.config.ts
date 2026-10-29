import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: context => blogSchema(context).extend({
				// Set by the translation tool on machine translated copies of a post: the notice
				// above the post follows `machineTranslated`, `sourceHash` ties the copy to the English text.
				machineTranslated: z.boolean().optional(),
				sourceHash: z.string().optional(),
			}),
		}),
	}),
};
