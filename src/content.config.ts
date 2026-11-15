import { readdir, readFile } from 'node:fs/promises';
import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { blogSchema } from 'starlight-blog/schema';
import { activeLocaleKeys, defaultLocale, langOf } from './i18n/locales';

/** Starlight interface strings that translators edit in the site catalogs (src/i18n/<key>.json). */
const catalogStarlightKey = /^aside\./;

/**
 * Starlight's i18n loader, plus the Starlight strings from the site catalogs. Those win over Starlight's
 * built-in dictionaries and over src/content/i18n, so a translator can fix a label such as the
 * Japanese "Note" box title in Weblate. Starlight keys entries without a file path by their `id`,
 * which must be the BCP 47 tag.
 */
function i18nWithCatalogsLoader(): Loader {
	const starlight = i18nLoader();
	return {
		name: 'redux-i18n-loader',
		load: async (context) => {
			await starlight.load(context);
			const catalogDir = new URL('src/i18n/', context.config.root);
			const locales = [defaultLocale, ...activeLocaleKeys(await readdir(catalogDir))];
			for (const locale of locales) {
				const catalog: Record<string, string> = JSON.parse(
					await readFile(new URL(`${locale}.json`, catalogDir), 'utf8'),
				);
				const strings = Object.fromEntries(
					Object.entries(catalog).filter(([key, value]) => catalogStarlightKey.test(key) && value),
				);
				if (Object.keys(strings).length === 0) continue;
				const lang = langOf(locale);
				// An entry from src/content/i18n keeps its file path, which is how Starlight finds it.
				const existing = context.store
					.values()
					.find((entry) => entry.filePath?.replace(/^.*[\\/]/, '').replace(/\.\w+$/, '') === lang);
				const id = existing?.id ?? lang;
				const data = await context.parseData({ id, data: { ...existing?.data, ...strings } });
				context.store.set({ ...existing, id, data });
			}
		},
	};
}

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
	// zh-Hant, so those two get its zh-CN and zh-TW dictionaries from src/content/i18n. The aside
	// labels come from the site catalogs on top of that.
	i18n: defineCollection({ loader: i18nWithCatalogsLoader(), schema: i18nSchema() }),
};
