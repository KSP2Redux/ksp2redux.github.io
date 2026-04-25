import type { APIContext } from 'astro';
import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

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

export async function GET(context: APIContext) {
	const base = context.site!.href.replace(/\/$/, '');
	const all = await getCollection('docs');
	const entries = all.filter((entry: any) =>
		(entry.id?.startsWith('blog/') || entry.filePath?.includes('/blog/')) && entry.data.draft !== true
	);

	entries.sort((a: any, b: any) => {
		const aDate = a.data.date ? new Date(a.data.date).valueOf() : 0;
		const bDate = b.data.date ? new Date(b.data.date).valueOf() : 0;
		return bDate - aDate;
	});

	const items: any[] = [];
	for (const entry of entries as any[]) {
		try {
			const { Content } = await render(entry);
			const rendered = await container.renderToString(Content);
			const content = transformForRss(rendered, base);
			const slug = entry.id.replace(/^blog\//, '');
			items.push({
				title: entry.data.title,
				link: `/blog/${slug}/`,
				pubDate: entry.data.date instanceof Date ? entry.data.date : new Date(entry.data.date),
				description: entry.data.description ?? '',
				content,
			});
		} catch (err: any) {
			console.warn(`[blog rss] failed to render ${entry.id}: ${err?.message ?? err}`);
		}
	}

	return rss({
		title: 'KSP2 Redux | Blog',
		description: '',
		site: context.site!,
		items,
		customData: '<language>en</language>',
	});
}
