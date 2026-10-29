import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection, render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { langOf, t, type LocaleKey } from '../i18n';
import { selectFeedPosts } from './blogFeed';

const container = await AstroContainer.create();
container.addServerRenderer({ name: '@astrojs/mdx', renderer: mdxRenderer });

const YOUTUBE_EMBED = /<div class="youtube-embed"[\s\S]*?data-youtube-id="([^"]+)"[\s\S]*?<\/div>/g;
const HEADING_ANCHOR = /<a class="sl-anchor-link"[\s\S]*?<\/a>/g;
const ROOT_ATTR = /(src|href|poster)="\/(?!\/)([^"]*)"/g;
const SRCSET_ATTR = /srcset="([^"]+)"/g;

function absolutizeSrcset(value: string, base: string): string {
	return value.split(',').map((part) => {
		const trimmed = part.trim();
		const spaceIdx = trimmed.indexOf(' ');
		const url = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
		const descriptor = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx);
		const absolute = url.startsWith('/') && !url.startsWith('//') ? `${base}${url}` : url;
		return `${absolute}${descriptor}`;
	}).join(', ');
}

function transformForRss(html: string, base: string): string {
	return html
		.replace(YOUTUBE_EMBED, (_m, id) => {
			const url = `https://www.youtube.com/watch?v=${id}`;
			return `<p><a href="${url}">${url}</a></p>`;
		})
		.replace(HEADING_ANCHOR, '')
		.replace(ROOT_ATTR, (_m, attr, path) => `${attr}="${base}/${path}"`)
		.replace(SRCSET_ATTR, (_m, value) => `srcset="${absolutizeSrcset(value, base)}"`);
}

/**
 * The blog feed of one language, or the English one when no locale is given. A language feed holds
 * its translated posts and, for every other post, the English one (see `selectFeedPosts`).
 */
export async function blogFeed(context: APIContext, locale?: LocaleKey) {
	const base = context.site!.href.replace(/\/$/, '');
	const posts = selectFeedPosts(await getCollection('docs'), locale);

	const items: any[] = [];
	for (const { entry, link } of posts as { entry: any; link: string }[]) {
		try {
			const { Content } = await render(entry);
			const rendered = await container.renderToString(Content);
			items.push({
				title: entry.data.title,
				link,
				pubDate: entry.data.date instanceof Date ? entry.data.date : new Date(entry.data.date),
				description: entry.data.description ?? '',
				content: transformForRss(rendered, base),
			});
		} catch (err: any) {
			console.warn(`[blog rss] failed to render ${entry.id}: ${err?.message ?? err}`);
		}
	}

	return rss({
		title: `KSP2 Redux | ${t(locale ?? 'en', 'nav.blog')}`,
		description: '',
		site: context.site!,
		items,
		customData: `<language>${langOf(locale ?? 'en')}</language>`,
	});
}
