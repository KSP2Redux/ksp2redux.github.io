import type { APIContext, GetStaticPaths } from 'astro';
import { blogLocales } from '../../../i18n';
import { blogFeed } from '../../../lib/blogFeedRender';

// One feed per language with translated posts. The other languages have no feed: the build removes
// the ones starlight-blog adds for them (see pruneBlogFeeds in astro.config.mjs).
export const getStaticPaths = (() =>
	blogLocales.map((locale) => ({ params: { locale }, props: { locale } }))) satisfies GetStaticPaths;

export async function GET(context: APIContext) {
	return blogFeed(context, (context.props as { locale: (typeof blogLocales)[number] }).locale);
}
