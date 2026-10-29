// Structure of the card grids in the guides. The text of every card lives in `src/i18n/en.json`
// under `guideCards.<set>.<id>.title` and `guideCards.<set>.<id>.body`; a body with a link ends in
// `{link}...{/link}`, and `href` is where that link goes.

export interface GuideCard {
	id: string;
	icon?: string;
	/** Site-relative path, `#anchor` or external URL. Cards without one have no link in their body. */
	href?: string;
}

export const guideCards = {
	index: [
		{ id: 'installation', icon: 'rocket', href: '/guides/installation/' },
		{ id: 'roadmap', icon: 'star', href: '/roadmap/' },
		{ id: 'frontier', icon: 'rocket', href: '/guides/frontier-and-exploration/' },
		{ id: 'implemented', icon: 'check-circle', href: '/guides/implemented-features-and-fixes/' },
		{ id: 'compatibility', icon: 'puzzle', href: '/guides/mod-compatibility/' },
		{ id: 'ksp1Parts', icon: 'puzzle', href: '/guides/ksp1-part-mods/' },
		{ id: 'flags', icon: 'star', href: '/guides/custom-flags/' },
		{ id: 'contributing', icon: 'heart', href: '/guides/contributing/' },
	],
	// The anchors are `<a id>` elements placed before the headings of contributing.mdx. They do not
	// follow the heading text, so they keep working when the headings are translated.
	contributing: [
		{ id: 'artists', href: '#contribute-3d-artists' },
		{ id: 'developers', href: '#contribute-developers' },
		{ id: 'translators', href: '#contribute-translators' },
		{ id: 'designMedia', href: '#contribute-design-media' },
		{ id: 'modders', href: '#contribute-modders' },
		{ id: 'players', href: '#contribute-players' },
	],
	testing: [
		{ id: 'beta', icon: 'rocket' },
		{ id: 'bugs', icon: 'warning' },
	],
} as const satisfies Record<string, readonly GuideCard[]>;

export type GuideCardSet = keyof typeof guideCards;
