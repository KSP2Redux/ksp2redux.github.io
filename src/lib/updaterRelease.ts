export const updaterRepo = 'KSP2Redux/Updater';
export const updaterReleasesUrl = `https://github.com/${updaterRepo}/releases/latest`;
export const updaterReleaseApiUrl = `https://api.github.com/repos/${updaterRepo}/releases/latest`;

export interface UpdaterAsset {
	name: string;
	label: string;
	platform: 'Windows' | 'Linux';
	kind: 'app' | 'cli';
}

export const updaterAssets: UpdaterAsset[] = [
	{ name: 'Ksp2Redux-win-x64.exe', label: 'Updater for Windows', platform: 'Windows', kind: 'app' },
	{ name: 'Ksp2Redux-linux-x64', label: 'Updater for Linux', platform: 'Linux', kind: 'app' },
	{ name: 'redux-cli-x64.exe', label: 'Command-line installer for Windows', platform: 'Windows', kind: 'cli' },
	{ name: 'redux-cli-x64', label: 'Command-line installer for Linux', platform: 'Linux', kind: 'cli' },
];

export interface ReleaseAssetInfo {
	size: number;
	sha256?: string;
}

export interface UpdaterReleaseInfo {
	tag: string;
	name: string;
	publishedAt: string;
	assets: Record<string, ReleaseAssetInfo>;
}

/**
 * GitHub redirects this URL to the named asset of whichever release is currently marked latest,
 * so links built from it never go stale.
 */
export function latestDownloadUrl(assetName: string): string {
	return `${updaterReleasesUrl}/download/${assetName}`;
}

export function formatSize(bytes: number): string {
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function formatReleaseDate(isoDate: string): string {
	return new Date(isoDate).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'UTC',
	});
}

export function updaterVersion(tag: string): string {
	return tag.replace(/^updater-/, '');
}

interface GitHubRelease {
	tag_name: string;
	name: string;
	published_at: string;
	assets: { name: string; size: number; digest?: string | null }[];
}

export function parseUpdaterRelease(release: GitHubRelease): UpdaterReleaseInfo {
	const assets: Record<string, ReleaseAssetInfo> = {};
	for (const asset of release.assets) {
		assets[asset.name] = {
			size: asset.size,
			sha256: asset.digest?.startsWith('sha256:') ? asset.digest.slice('sha256:'.length) : undefined,
		};
	}
	return { tag: release.tag_name, name: release.name, publishedAt: release.published_at, assets };
}

/**
 * Returns `undefined` instead of throwing when GitHub is unreachable or rate-limited,
 * so the page still renders working download links without version details.
 */
export async function fetchLatestUpdaterRelease(token?: string): Promise<UpdaterReleaseInfo | undefined> {
	try {
		const response = await fetch(updaterReleaseApiUrl, {
			headers: {
				Accept: 'application/vnd.github+json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
		});
		if (!response.ok) return undefined;
		return parseUpdaterRelease(await response.json());
	} catch {
		return undefined;
	}
}
