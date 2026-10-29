// Which posts go into which blog feed. Pure module, so the tests can import it.
//
// Docs entry ids: English posts are `blog/<slug>`, translated ones `<locale key>/blog/<slug>`.

export interface FeedEntry {
	id: string;
	data: { date?: Date | string; draft?: boolean };
}

export interface FeedPost<Entry extends FeedEntry = FeedEntry> {
	entry: Entry;
	slug: string;
	/** Page of the post, relative to the site root. */
	link: string;
	/** False for the English post that stands in for a missing translation. */
	translated: boolean;
}

const dateOf = (entry: FeedEntry) => (entry.data.date ? new Date(entry.data.date).valueOf() : 0);

// Posts on the same date keep the order of the content collection.
const newestFirst = (a: FeedPost, b: FeedPost) => dateOf(b.entry) - dateOf(a.entry);

/** The slug of a post in the given folder (`blog` or `<locale key>/blog`), or undefined for other entries. */
function slugIn(id: string, folder: string): string | undefined {
	if (!id.startsWith(`${folder}/`)) return undefined;
	const slug = id.slice(folder.length + 1);
	return slug === '' || slug === 'index' || slug.includes('/') ? undefined : slug;
}

/** Posts of one folder by slug, without drafts. */
function postsIn<Entry extends FeedEntry>(entries: readonly Entry[], folder: string) {
	const posts = new Map<string, Entry>();
	for (const entry of entries) {
		const slug = slugIn(entry.id, folder);
		if (slug !== undefined && entry.data.draft !== true) posts.set(slug, entry);
	}
	return posts;
}

/**
 * The posts of a feed, newest first.
 *
 * Without a locale that is every English post. With a locale it is every translated post, plus the
 * English post of each slug that has no translation yet, linked to the English page.
 */
export function selectFeedPosts<Entry extends FeedEntry>(entries: readonly Entry[], locale?: string): FeedPost<Entry>[] {
	const english = postsIn(entries, 'blog');
	if (locale === undefined) {
		return [...english].map(([slug, entry]) => ({ entry, slug, link: `/blog/${slug}/`, translated: false })).sort(newestFirst);
	}

	const translated = postsIn(entries, `${locale}/blog`);
	const posts: FeedPost<Entry>[] = [];
	for (const [slug, entry] of translated) {
		posts.push({ entry, slug, link: `/${locale}/blog/${slug}/`, translated: true });
	}
	for (const [slug, entry] of english) {
		if (!translated.has(slug)) posts.push({ entry, slug, link: `/blog/${slug}/`, translated: false });
	}
	return posts.sort(newestFirst);
}
