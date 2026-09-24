import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

const blogIndexPath = /^\/blog(?:\/(\d+))?\/?$/;
const blogIndexTitle = 'Dev Blog & Release Notes';

export const onRequest = defineRouteMiddleware(async (context, next) => {
	await next();

	const match = context.url.pathname.match(blogIndexPath);
	if (!match) return;

	const pageNumber = match[1];
	const pageTitle = pageNumber ? `${blogIndexTitle} – Page ${pageNumber}` : blogIndexTitle;
	const { head, entry } = context.locals.starlightRoute;

	for (const tag of head) {
		if (tag.tag === 'title') {
			tag.content = tag.content?.replace(entry.data.title, pageTitle);
		} else if (tag.tag === 'meta' && tag.attrs?.property === 'og:title') {
			tag.attrs.content = pageTitle;
		}
	}
});
