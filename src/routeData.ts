import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

const blogPaginationPath = /^\/blog\/(\d+)\/?$/;

export const onRequest = defineRouteMiddleware(async (context, next) => {
	await next();

	const pageNumber = context.url.pathname.match(blogPaginationPath)?.[1];
	if (!pageNumber) return;

	const { head, entry } = context.locals.starlightRoute;
	const pageTitle = `${entry.data.title} – Page ${pageNumber}`;

	for (const tag of head) {
		if (tag.tag === 'title') {
			tag.content = tag.content?.replace(entry.data.title, pageTitle);
		} else if (tag.tag === 'meta' && tag.attrs?.property === 'og:title') {
			tag.attrs.content = pageTitle;
		}
	}
});
