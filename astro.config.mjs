// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightBlog from 'starlight-blog';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync, rmSync } from 'node:fs';
import { activeLocaleKeys, blogLocaleKeys, localeLangs, nativeName } from './src/i18n/locales.ts';

// A locale is active when its string catalog src/i18n/<key>.json exists. Without any, the site is
// English only and Starlight stays monolingual.
const i18nDir = new URL('./src/i18n/', import.meta.url);
const activeLocales = activeLocaleKeys(readdirSync(i18nDir));
const readCatalog = (key) => JSON.parse(readFileSync(new URL(`${key}.json`, i18nDir), 'utf8'));
const english = readCatalog('en');
const catalogs = Object.fromEntries(activeLocales.map((key) => [key, readCatalog(key)]));

// Languages with translated blog posts (src/content/docs/<locale key>/blog/*.mdx), same rule as src/i18n/index.ts.
const docsDir = new URL('./src/content/docs/', import.meta.url);
const blogLocales = blogLocaleKeys(
	readdirSync(docsDir, { recursive: true }).map((file) => `docs/${file}`),
	activeLocales,
);

/**
 * starlight-blog builds feeds for every language, from the English posts. The language feeds in
 * src/pages/[locale]/blog/rss.xml.ts replace the main ones (the route is more specific), so this
 * removes the rest: its archive feeds, and the main feed of a language without translated posts.
 */
const pruneBlogFeeds = {
	name: 'prune-blog-feeds',
	hooks: {
		'astro:build:done': ({ dir }) => {
			for (const locale of activeLocales) {
				rmSync(new URL(`${locale}/blog/rss/`, dir), { recursive: true, force: true });
				if (!blogLocales.includes(locale)) rmSync(new URL(`${locale}/blog/rss.xml`, dir), { force: true });
			}
		},
	},
};

/** A catalog string for every language that has one, keyed by BCP 47 tag (the shape Starlight and starlight-blog expect). */
const translationsOf = (key) =>
	Object.fromEntries(
		activeLocales.filter((locale) => catalogs[locale][key]).map((locale) => [localeLangs[locale], catalogs[locale][key]]),
	);

/** A sidebar label from the catalog, with the translations that exist. */
const sidebarLabel = (key) => ({
	label: english[key],
	translations: translationsOf(key),
});

// https://astro.build/config
export default defineConfig({
	site: 'https://ksp2redux.org',
	server: { port: Number(process.env.PORT) || 4321 },
	vite: {
		plugins: [tailwindcss()],
	},
	integrations: [
		starlight({
			plugins: [starlightBlog({
				title: activeLocales.length > 0 ? { en: english['blog.title'], ...translationsOf('blog.title') } : english['blog.title'],
				recentPostCount: Infinity,
				authors: {
					redux: {
						name: 'Redux Team',
						title: 'KSP2 Redux contributors',
						picture: 'https://styles.redditmedia.com/t5_g4hm02/styles/communityIcon_rvtruzn4i47g1.png?width=128&frame=1&auto=webp&s=383d92582a7abb7f0a010604ed9625807cc24f82',
					}
				}
			})],
			title: 'KSP2 Redux',
			...(activeLocales.length > 0 && {
				defaultLocale: 'root',
				locales: {
					root: { label: nativeName('en'), lang: 'en' },
					...Object.fromEntries(
						activeLocales.map((key) => [key, { label: nativeName(key), lang: localeLangs[key] }]),
					),
				},
			}),
			routeMiddleware: './src/routeData.ts',
			head: [
				{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/inter-latin.woff2', crossorigin: 'anonymous' } },
				{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/exo2-latin.woff2', crossorigin: 'anonymous' } },
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://ksp2redux.org/og-image.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1200' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '630' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://ksp2redux.org/og-image.png' } },
			],
			favicon: '/favicon.ico',
			logo: {
				src: './src/assets/logo.png',
				alt: 'KSP2 Redux Logo',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/KSP2Redux/Redux' }],
			// Custom CSS for theming
			customCss: [
				'./src/styles/global.css',
			],
			// Component overrides for unified branding
			components: {
				Banner: './src/components/Banner.astro',
				Header: './src/components/Header.astro',
				Footer: './src/components/Footer.astro',
				Hero: './src/components/StarlightHero.astro',
				MarkdownContent: './src/components/StarlightMarkdownContent.astro',
			},
			sidebar: [
				{
					...sidebarLabel('sidebar.gettingStarted'),
					items: [{ autogenerate: { directory: 'guides' } }],
				},
				{
					...sidebarLabel('sidebar.moddingDocumentation'),
					link: 'https://modding.ksp2redux.org',
				},
				{
					...sidebarLabel('sidebar.apiReference'),
					link: 'https://api.ksp2redux.org',
				}
			],
			expressiveCode: {
				themes: ['starlight-dark']
			}
		}),
		pruneBlogFeeds,
	],
});
