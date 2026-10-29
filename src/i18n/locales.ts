// The one place that maps site locale keys (URL prefixes, catalog file names, Starlight directories)
// to BCP 47 language tags. Pure module: no file system or Vite access, so astro.config.mjs and the
// tests can import it too.

export const defaultLocale = 'en';
export const defaultLang = 'en';

/** Site key -> canonical BCP 47 tag. Keys are lowercase, tags are used for `lang` and `hreflang`. */
export const localeLangs = {
	de: 'de',
	es: 'es',
	fr: 'fr',
	it: 'it',
	ja: 'ja',
	ko: 'ko',
	pl: 'pl',
	'pt-br': 'pt-BR',
	ru: 'ru',
	'zh-hans': 'zh-Hans',
	'zh-hant': 'zh-Hant',
} as const;

export type LocaleKey = keyof typeof localeLangs;
/** `en` or an active translated locale. */
export type Locale = typeof defaultLocale | LocaleKey;

export function isLocaleKey(value: string): value is LocaleKey {
	return Object.hasOwn(localeLangs, value);
}

/**
 * Active locales are the ones with a `<key>.json` string catalog. `en.json` is the source, not a
 * translation, and unknown file names are ignored.
 */
export function activeLocaleKeys(fileNames: Iterable<string>): LocaleKey[] {
	const keys = new Set<LocaleKey>();
	for (const fileName of fileNames) {
		const match = /^(?:.*[\\/])?([^\\/]+)\.json$/.exec(fileName);
		if (match && isLocaleKey(match[1])) keys.add(match[1]);
	}
	return [...keys].sort();
}

export function langOf(locale: Locale): string {
	return locale === defaultLocale ? defaultLang : localeLangs[locale];
}

/** The language written in itself, e.g. `Deutsch` or `日本語`. */
export function nativeName(locale: Locale): string {
	const lang = langOf(locale);
	const name = new Intl.DisplayNames([lang], { type: 'language' }).of(lang) ?? lang;
	return name.charAt(0).toLocaleUpperCase(lang) + name.slice(1);
}

/** `pt-BR` -> `pt_BR`, the form `og:locale` expects. English stays `en` as before. */
export function ogLocale(locale: Locale): string {
	return langOf(locale).replace('-', '_');
}

/** The locale a URL path belongs to, given the active locales. Unprefixed paths are English. */
export function localeFromPath(pathname: string, active: readonly LocaleKey[]): Locale {
	const first = pathname.split('/')[1]?.toLowerCase() ?? '';
	return (active as readonly string[]).includes(first) ? (first as LocaleKey) : defaultLocale;
}

/** Removes the locale prefix, so `/de/faq/` becomes `/faq/` and `/de` becomes `/`. */
export function stripLocale(pathname: string, active: readonly LocaleKey[]): string {
	const locale = localeFromPath(pathname, active);
	if (locale === defaultLocale) return pathname;
	const rest = pathname.slice(locale.length + 1);
	return rest.startsWith('/') ? rest : `/${rest}`;
}

/** Pages that exist in English only, in every language. Links to them never get a locale prefix and they have no language alternates. */
const englishOnlyPrefixes = ['/privacy-policy', '/terms-of-service'];

function hasPrefix(path: string, prefix: string): boolean {
	return path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}#`) || path.startsWith(`${prefix}?`);
}

/** Whether a path (without locale prefix) has no translated version in any language. */
export function isEnglishOnlyPath(path: string): boolean {
	return englishOnlyPrefixes.some((prefix) => hasPrefix(path, prefix));
}

/**
 * The locales that have their own blog: the ones with at least one translated post, given the
 * module paths of the content files (`.../content/docs/<locale key>/blog/<slug>.mdx`).
 * Folders of locales that are not active are ignored.
 */
export function blogLocaleKeys(filePaths: Iterable<string>, active: readonly LocaleKey[]): LocaleKey[] {
	const keys = new Set<LocaleKey>();
	for (const filePath of filePaths) {
		const match = /(?:^|[\\/])docs[\\/]([^\\/]+)[\\/]blog[\\/][^\\/]+\.mdx?$/.exec(filePath);
		if (match && isLocaleKey(match[1]) && active.includes(match[1])) keys.add(match[1]);
	}
	return [...keys].sort();
}

/**
 * Adds the locale prefix to a site-relative path. External links, `mailto:`, bare hashes and
 * English-only pages are returned as they are. The blog is prefixed only for the locales in
 * `blogLocales`; the others keep linking to the English blog.
 */
export function localizePath(path: string, locale: Locale, blogLocales: readonly LocaleKey[] = []): string {
	if (locale === defaultLocale || !path.startsWith('/') || path.startsWith('//') || isEnglishOnlyPath(path)) {
		return path;
	}
	if (hasPrefix(path, '/blog') && !(blogLocales as readonly string[]).includes(locale)) return path;
	return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}
