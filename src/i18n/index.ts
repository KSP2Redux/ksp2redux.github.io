import en from './en.json';
import { createTranslator, type Catalog } from './format';
import {
	activeLocaleKeys,
	blogLocaleKeys,
	defaultLocale,
	isEnglishOnlyPath,
	langOf,
	localeFromPath,
	localizePath as localizePathFor,
	nativeName,
	stripLocale,
	type Locale,
} from './locales';

export type { Locale, LocaleKey } from './locales';
export type { RichSlot, Vars } from './format';
export { langOf, nativeName, ogLocale } from './locales';

export type MessageKey = keyof typeof en;

// Every `<key>.json` next to this file is a catalog. A locale is active when its catalog exists.
const files = import.meta.glob<Catalog>('./*.json', { eager: true, import: 'default' });
const catalogs: Record<string, Catalog> = {};
for (const [path, catalog] of Object.entries(files)) {
	catalogs[path.slice('./'.length, -'.json'.length)] = catalog;
}

/** Active translated locales, not including English. */
export const locales = activeLocaleKeys(Object.keys(files));
export const isMultilingual = locales.length > 0;

// Machine translated posts live in src/content/docs/<locale key>/blog/. A locale with at least one
// has its own blog under /<locale>/blog/; the others link to the English blog.
const posts = import.meta.glob('/src/content/docs/*/blog/*.{md,mdx}');

/** Active locales that have at least one translated blog post. */
export const blogLocales = blogLocaleKeys(Object.keys(posts), locales);

export function hasBlog(locale: Locale): boolean {
	return (blogLocales as readonly string[]).includes(locale);
}

/** Adds the locale prefix to a site-relative path, see `localizePath` in `locales.ts`. */
export function localizePath(path: string, locale: Locale): string {
	return localizePathFor(path, locale, blogLocales);
}

export const { t, rich, isTranslated } = createTranslator<MessageKey>(en, catalogs, defaultLocale);

export function getLocale(pathname: string): Locale {
	return localeFromPath(pathname, locales);
}

/** The path without its locale prefix, e.g. `/de/faq/` -> `/faq/`. */
export function basePath(pathname: string): string {
	return stripLocale(pathname, locales);
}

/** For `getStaticPaths` of the `[locale]` routes. Empty while no translation catalog exists. */
export function localeStaticPaths() {
	return locales.map((locale) => ({ params: { locale } }));
}

/** Pages without a translated version have no alternates and no language switcher. */
export function alternateLinks(pathname: string, site: URL) {
	const path = basePath(pathname);
	if (isEnglishOnlyPath(path)) return [];
	return [defaultLocale as Locale, ...locales].map((locale) => ({
		locale,
		lang: langOf(locale),
		href: new URL(localizePath(path, locale), site).href,
	}));
}

export function languageOptions(pathname: string, current: Locale) {
	const path = basePath(pathname);
	if (isEnglishOnlyPath(path)) return [];
	return [defaultLocale as Locale, ...locales].map((locale) => ({
		locale,
		lang: langOf(locale),
		name: nativeName(locale),
		href: localizePath(path, locale),
		current: locale === current,
	}));
}
