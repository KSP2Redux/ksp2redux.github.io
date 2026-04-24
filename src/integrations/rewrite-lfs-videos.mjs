import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, extname } from 'node:path';

const REPO = 'KSP2Redux/ksp2redux.github.io';
const REF = 'main';
const PATTERN = /(["'(])\/blog\/redux-news\/([^"'()\s]+\.mp4)/g;

function walkHtml(dir, out = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const s = statSync(full);
		if (s.isDirectory()) walkHtml(full, out);
		else if (extname(full) === '.html') out.push(full);
	}
	return out;
}

export default function rewriteLfsVideos() {
	return {
		name: 'rewrite-lfs-videos',
		hooks: {
			'astro:build:done': ({ dir, logger }) => {
				const outDir = fileURLToPath(dir);
				const replacement = `$1https://media.githubusercontent.com/media/${REPO}/${REF}/public/blog/redux-news/$2`;
				let filesChanged = 0;
				let urlsRewritten = 0;
				for (const file of walkHtml(outDir)) {
					const before = readFileSync(file, 'utf8');
					const matches = before.match(PATTERN);
					if (!matches) continue;
					writeFileSync(file, before.replace(PATTERN, replacement));
					filesChanged++;
					urlsRewritten += matches.length;
				}
				const log = logger?.info?.bind(logger) ?? console.log;
				log(`rewrote ${urlsRewritten} LFS video URL(s) across ${filesChanged} HTML file(s)`);
			},
		},
	};
}
