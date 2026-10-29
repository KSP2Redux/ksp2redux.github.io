export type Vars = Record<string, string | number>;
export type Catalog = Record<string, string>;

export interface RichSlot {
	tag: 'a' | 'strong' | 'code' | 'span';
	attrs?: Record<string, string | undefined>;
}

const placeholderPattern = /\{([^{}]+)\}/g;

/** Replaces `{name}` with `vars.name`. Unknown placeholders are left as they are. */
export function interpolate(template: string, vars?: Vars): string {
	if (!vars) return template;
	return template.replace(placeholderPattern, (match, name: string) =>
		Object.hasOwn(vars, name) ? String(vars[name]) : match,
	);
}

/** Every distinct `{placeholder}` in a message, sorted. Closing tags such as `{/link}` count as their own entry. */
export function placeholdersOf(message: string): string[] {
	return [...new Set([...message.matchAll(placeholderPattern)].map((match) => match[1]))].sort();
}

export function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
}

/**
 * Renders a message that contains inline markup as an HTML string for `set:html`.
 *
 * Translators only see `{slot}text{/slot}` pairs and `{var}` values. Which element a slot becomes,
 * and its attributes, are decided in code, and all message text is escaped, so a catalog cannot
 * inject markup. Unknown placeholders stay as literal text, and unbalanced slots are closed or dropped.
 */
export function renderRich(template: string, slots: Record<string, RichSlot>, vars?: Vars): string {
	const open: string[] = [];
	let html = '';
	let last = 0;

	for (const match of template.matchAll(/\{(\/?)([^{}/]+)\}/g)) {
		const [token, closing, name] = match;
		html += escapeHtml(template.slice(last, match.index));
		last = match.index + token.length;

		const slot = Object.hasOwn(slots, name) ? slots[name] : undefined;
		if (slot && !closing) {
			const attrs = Object.entries(slot.attrs ?? {})
				.filter((entry): entry is [string, string] => entry[1] !== undefined)
				.map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
				.join('');
			html += `<${slot.tag}${attrs}>`;
			open.push(slot.tag);
		} else if (slot && closing) {
			if (open.length > 0) html += `</${open.pop()}>`;
		} else if (!closing && vars && Object.hasOwn(vars, name)) {
			html += escapeHtml(String(vars[name]));
		} else {
			html += escapeHtml(token);
		}
	}

	html += escapeHtml(template.slice(last));
	while (open.length > 0) html += `</${open.pop()}>`;
	return html;
}

/**
 * Looks a key up in the locale catalog and falls back to the English source per key, so a
 * translation file with missing keys (or an empty value) still renders complete pages.
 */
export function createTranslator<Key extends string>(
	source: Record<Key, string>,
	catalogs: Record<string, Catalog | undefined>,
	defaultLocale = 'en',
) {
	const lookup = (locale: string, key: Key): string => {
		if (locale !== defaultLocale) {
			const translated = catalogs[locale]?.[key];
			if (translated) return translated;
		}
		const fallback = source[key];
		if (fallback === undefined) throw new Error(`Missing i18n key "${key}" in the English catalog`);
		return fallback;
	};

	return {
		t: (locale: string, key: Key, vars?: Vars) => interpolate(lookup(locale, key), vars),
		rich: (locale: string, key: Key, slots: Record<string, RichSlot>, vars?: Vars) =>
			renderRich(lookup(locale, key), slots, vars),
		isTranslated: (locale: string, key: Key) => locale === defaultLocale || Boolean(catalogs[locale]?.[key]),
	};
}
