import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { basePath, getLocale, hasBlog, t } from './i18n';

const blogIndexPath = /^\/blog(?:\/(\d+))?\/?$/;

interface SidebarEntry {
	type: string;
	href?: string;
	entries?: SidebarEntry[];
}

/**
 * starlight-blog links its RSS feed in the sidebar of every language. Only the languages with
 * translated posts have a feed of their own, the others use the English one.
 */
function fixFeedLinks(entries: SidebarEntry[]) {
	for (const entry of entries) {
		if (entry.type === 'group' && entry.entries) fixFeedLinks(entry.entries);
		if (entry.type !== 'link' || !entry.href) continue;
		const locale = getLocale(entry.href);
		if (locale !== 'en' && !hasBlog(locale) && basePath(entry.href) === '/blog/rss.xml') entry.href = '/blog/rss.xml';
	}
}

export const onRequest = defineRouteMiddleware(async (context, next) => {
	await next();

	fixFeedLinks(context.locals.starlightRoute.sidebar as SidebarEntry[]);

	const locale = getLocale(context.url.pathname);
	const match = basePath(context.url.pathname).match(blogIndexPath);
	if (!match) return;

	const pageNumber = match[1];
	const blogIndexTitle = t(locale, 'blog.index.title');
	const pageTitle = pageNumber
		? t(locale, 'blog.index.titlePaged', { title: blogIndexTitle, page: pageNumber })
		: blogIndexTitle;
	const { head, entry } = context.locals.starlightRoute;

	for (const tag of head) {
		if (tag.tag === 'title') {
			tag.content = tag.content?.replace(entry.data.title, pageTitle);
		} else if (tag.tag === 'meta' && tag.attrs?.property === 'og:title') {
			tag.attrs.content = pageTitle;
		}
	}
});
