import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const BLOCK_PATTERN = /&lt;div&gt;\s*&lt;iframe[\s\S]*?data-youtube-id=&quot;([^&]+)&quot;[\s\S]*?&lt;\/iframe&gt;\s*&lt;\/div&gt;/g;

export default function rewriteYouTubeInRss() {
	return {
		name: 'rewrite-youtube-in-rss',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const rssPath = join(outDir, 'blog', 'rss.xml');
				if (!existsSync(rssPath)) return;
				const before = readFileSync(rssPath, 'utf8');
				let count = 0;
				const after = before.replace(BLOCK_PATTERN, (_match, id) => {
					count++;
					const url = `https://www.youtube.com/watch?v=${id}`;
					return `&lt;p&gt;&lt;a href=&quot;${url}&quot;&gt;${url}&lt;/a&gt;&lt;/p&gt;`;
				});
				if (count > 0) writeFileSync(rssPath, after);
				const log = logger?.info?.bind(logger) ?? console.log;
				log(`rewrote ${count} YouTube embed(s) in RSS feed`);
			},
		},
	};
}
