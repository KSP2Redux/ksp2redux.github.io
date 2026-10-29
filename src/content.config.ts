import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
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
	// Starlight's own interface text. Its built-in lookup cannot match the script subtags of zh-Hans and
	// zh-Hant, so those two get its zh-CN and zh-TW dictionaries from src/content/i18n.
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};
