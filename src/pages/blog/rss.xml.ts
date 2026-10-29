import type { APIContext } from 'astro';
import { blogFeed } from '../../lib/blogFeedRender';

// The English feed. It takes the place of the route starlight-blog injects for the same path.
export async function GET(context: APIContext) {
	return blogFeed(context);
}
