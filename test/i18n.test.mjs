import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { createTranslator, interpolate, placeholdersOf, renderRich } from '../src/i18n/format.ts'
import {
  activeLocaleKeys,
  blogLocaleKeys,
  isEnglishOnlyPath,
  langOf,
  localeFromPath,
  localizePath,
  localeLangs,
  nativeName,
  ogLocale,
  stripLocale
} from '../src/i18n/locales.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const i18nDir = path.join(rootDir, 'src', 'i18n')

async function readCatalog (fileName) {
  return JSON.parse(await readFile(path.join(i18nDir, fileName), 'utf8'))
}

async function sourceFiles (dir) {
  const files = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...await sourceFiles(full))
    else if (/\.(astro|ts)$/.test(entry.name)) files.push(full)
  }
  return files
}

test('a locale is active when its catalog file exists', () => {
  assert.deepEqual(activeLocaleKeys(['en.json']), [])
  assert.deepEqual(activeLocaleKeys(['en.json', 'pt-br.json', 'de.json']), ['de', 'pt-br'])
  assert.deepEqual(activeLocaleKeys(['./de.json', 'src/i18n/fr.json', 'C:\\x\\ja.json']), ['de', 'fr', 'ja'])
})

test('files that are not catalogs of a known locale are ignored', () => {
  assert.deepEqual(activeLocaleKeys(['index.ts', 'format.ts', 'xx.json', 'de.json.bak', 'DE.json', 'de.txt']), [])
})

test('site keys are lowercase and map to canonical BCP 47 tags', () => {
  for (const key of Object.keys(localeLangs)) assert.equal(key, key.toLowerCase())
  assert.equal(langOf('en'), 'en')
  assert.equal(langOf('pt-br'), 'pt-BR')
  assert.equal(langOf('zh-hans'), 'zh-Hans')
  assert.equal(langOf('zh-hant'), 'zh-Hant')
  assert.equal(ogLocale('pt-br'), 'pt_BR')
  assert.equal(ogLocale('en'), 'en')
})

test('languages are named in themselves', () => {
  assert.equal(nativeName('en'), 'English')
  assert.equal(nativeName('de'), 'Deutsch')
  assert.equal(nativeName('ja'), '日本語')
})

test('locale prefixes are found, stripped and added', () => {
  const active = ['de', 'pt-br']
  assert.equal(localeFromPath('/de/faq/', active), 'de')
  assert.equal(localeFromPath('/de', active), 'de')
  assert.equal(localeFromPath('/faq/', active), 'en')
  assert.equal(localeFromPath('/fr/faq/', active), 'en')
  assert.equal(localeFromPath('/deploy/', active), 'en')
  assert.equal(stripLocale('/de/faq/', active), '/faq/')
  assert.equal(stripLocale('/de/', active), '/')
  assert.equal(stripLocale('/de', active), '/')
  assert.equal(stripLocale('/faq/', active), '/faq/')
  assert.equal(localizePath('/faq/', 'de'), '/de/faq/')
  assert.equal(localizePath('/', 'pt-br'), '/pt-br/')
  assert.equal(localizePath('/guides/installation/#requirements', 'de'), '/de/guides/installation/#requirements')
})

test('English URLs never change, and external links are never prefixed', () => {
  assert.equal(localizePath('/faq/', 'en'), '/faq/')
  assert.equal(localizePath('/', 'en'), '/')
  assert.equal(localizePath('/blog/', 'en', ['de']), '/blog/')
  assert.equal(localizePath('/blogging/', 'de'), '/de/blogging/')
  assert.equal(localizePath('https://discord.gg/ksp2redux', 'de'), 'https://discord.gg/ksp2redux')
  assert.equal(localizePath('mailto:contact@ksp2redux.org', 'de'), 'mailto:contact@ksp2redux.org')
  assert.equal(localizePath('#command-line', 'de'), '#command-line')
})

test('the legal pages are English only in every language', () => {
  for (const legal of ['/privacy-policy', '/privacy-policy/', '/terms-of-service/', '/terms-of-service/#cookies']) {
    assert.equal(isEnglishOnlyPath(legal), true, legal)
    assert.equal(localizePath(legal, 'de', ['de']), legal)
    assert.equal(localizePath(legal, 'pt-br'), legal)
  }
  assert.equal(isEnglishOnlyPath('/privacy-policy-faq/'), false)
  assert.equal(isEnglishOnlyPath('/faq/'), false)
  assert.equal(isEnglishOnlyPath('/blog/'), false)
})

test('a language links to its own blog only when it has translated posts', () => {
  const blogLocales = ['de']
  assert.equal(localizePath('/blog/', 'de', blogLocales), '/de/blog/')
  assert.equal(localizePath('/blog', 'de', blogLocales), '/de/blog')
  assert.equal(localizePath('/blog/2/', 'de', blogLocales), '/de/blog/2/')
  assert.equal(localizePath('/blog/', 'ru', blogLocales), '/blog/')
  assert.equal(localizePath('/blog/', 'ru'), '/blog/')
  assert.equal(localizePath('/blog/snapshot-26w43b/', 'ru', blogLocales), '/blog/snapshot-26w43b/')
  assert.equal(localizePath('/faq/', 'ru', blogLocales), '/ru/faq/')
})

test('blog locales are the active locales with a translated post', () => {
  const active = ['de', 'pt-br', 'ru']
  assert.deepEqual(blogLocaleKeys([], active), [])
  assert.deepEqual(blogLocaleKeys(['/src/content/docs/blog/beta-1.mdx', '/src/content/docs/guides/installation.mdx'], active), [])
  assert.deepEqual(
    blogLocaleKeys(['/src/content/docs/de/blog/beta-1.mdx', '/src/content/docs/de/blog/beta-2.mdx', '/src/content/docs/pt-br/blog/x.md'], active),
    ['de', 'pt-br']
  )
  // Inactive locales and folders that are not a blog are ignored.
  assert.deepEqual(blogLocaleKeys(['/src/content/docs/fr/blog/x.mdx', '/src/content/docs/ru/guides/x.mdx'], active), [])
  assert.deepEqual(blogLocaleKeys(['C:\\site\\src\\content\\docs\\ru\\blog\\x.mdx'], active), ['ru'])
})

test('interpolation replaces known placeholders and keeps unknown ones', () => {
  assert.equal(interpolate('Page {page} of {total}', { page: 2, total: '15' }), 'Page 2 of 15')
  assert.equal(interpolate('Hello {name}', { other: 'x' }), 'Hello {name}')
  assert.equal(interpolate('No placeholders'), 'No placeholders')
  assert.equal(interpolate('{a}{a}', { a: 'x' }), 'xx')
})

test('placeholders are listed once and sorted', () => {
  assert.deepEqual(placeholdersOf('{b} and {a} and {b}'), ['a', 'b'])
  assert.deepEqual(placeholdersOf('{link}text{/link}'), ['/link', 'link'])
  assert.deepEqual(placeholdersOf('plain'), [])
})

test('missing and empty translations fall back to English per key', () => {
  const { t, isTranslated } = createTranslator(
    { 'a.one': 'One', 'a.two': 'Two {n}', 'a.three': 'Three' },
    { de: { 'a.one': 'Eins', 'a.two': 'Zwei {n}', 'a.three': '' } }
  )
  assert.equal(t('de', 'a.one'), 'Eins')
  assert.equal(t('de', 'a.two', { n: 2 }), 'Zwei 2')
  assert.equal(t('de', 'a.three'), 'Three')
  assert.equal(t('fr', 'a.one'), 'One')
  assert.equal(t('en', 'a.two', { n: 1 }), 'Two 1')
  assert.equal(isTranslated('de', 'a.one'), true)
  assert.equal(isTranslated('de', 'a.three'), false)
  assert.equal(isTranslated('en', 'a.three'), true)
})

test('English is never read from a locale catalog, and unknown keys throw', () => {
  const { t } = createTranslator({ 'a.one': 'One' }, { en: { 'a.one': 'Wrong' } })
  assert.equal(t('en', 'a.one'), 'One')
  assert.throws(() => t('en', 'a.missing'), /a\.missing/)
})

test('rich messages turn slots into the elements chosen in code and escape everything else', () => {
  const slots = { link: { tag: 'a', attrs: { href: '/x/?a=1&b="2"', class: 'c' } }, strong: { tag: 'strong' } }
  assert.equal(
    renderRich('See {link}the <b>guide</b>{/link} & {strong}{name}{/strong}.', slots, { name: '<i>Bob</i>' }),
    'See <a href="/x/?a=1&amp;b=&quot;2&quot;" class="c">the &lt;b&gt;guide&lt;/b&gt;</a> &amp; <strong>&lt;i&gt;Bob&lt;/i&gt;</strong>.'
  )
})

test('rich messages survive broken slot pairs', () => {
  const slots = { link: { tag: 'a' } }
  assert.equal(renderRich('a {link}b', slots), 'a <a>b</a>')
  assert.equal(renderRich('a{/link} b', slots), 'a b')
  assert.equal(renderRich('{unknown}x{/unknown} {name}', slots), '{unknown}x{/unknown} {name}')
})

// --- Guard: templates, English source and translation catalogs must agree ---

const english = await readCatalog('en.json')
const englishKeys = new Set(Object.keys(english))
const namespaces = new Set([...englishKeys].map((key) => key.split('.')[0]))

test('every English message is a non-empty string without markup', () => {
  for (const [key, value] of Object.entries(english)) {
    assert.equal(typeof value, 'string', key)
    assert.notEqual(value.trim(), '', `${key} is empty`)
    assert.doesNotMatch(value, /<\/?[a-z][^>]*>/i, `${key} contains markup`)
  }
})

/** The argument expression after `locale,` of every `t(...)`, `rich(...)` and `isTranslated(...)` call. */
function keyArguments (source) {
  const expressions = []
  for (const match of source.matchAll(/(?<![\w.$])(?:t|rich|isTranslated)\(\s*[\w.]+\s*,/g)) {
    let depth = 0
    let end = match.index + match[0].length
    for (; end < source.length; end++) {
      const char = source[end]
      if (char === '(' || char === '[' || char === '{') depth++
      else if (char === ')' || char === ']' || char === '}') {
        if (depth === 0) break
        depth--
      } else if (char === ',' && depth === 0) break
    }
    expressions.push(source.slice(match.index + match[0].length, end))
  }
  return expressions
}

/** String and template literals that look like a message key. `${...}` becomes a wildcard. */
function keyLiterals (text) {
  const literals = []
  for (const match of text.matchAll(/(['"`])([A-Za-z][\w-]*(?:\.(?:[\w-]|\$\{[^}]*\})+)+)\1/g)) {
    literals.push(match[2])
  }
  return literals
}

function matcherFor (literal) {
  if (!literal.includes('${')) return (key) => key === literal
  const pattern = literal
    .split(/\$\{[^}]*\}/)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.+')
  return (key) => new RegExp(`^${pattern}$`).test(key)
}

test('every key used by a template or script exists in en.json', async () => {
  const used = new Map()
  for (const file of await sourceFiles(path.join(rootDir, 'src'))) {
    if (file.startsWith(i18nDir)) continue
    const source = await readFile(file, 'utf8')
    const candidates = [
      ...keyArguments(source).flatMap(keyLiterals),
      // Keys passed around before they reach t(), such as `{ key: 'nav.home' }`.
      ...keyLiterals(source).filter((literal) => namespaces.has(literal.split('.')[0]))
    ]
    for (const literal of candidates) {
      if (!used.has(literal)) used.set(literal, path.relative(rootDir, file))
    }
  }
  // Also the keys astro.config.mjs reads.
  const config = await readFile(path.join(rootDir, 'astro.config.mjs'), 'utf8')
  for (const literal of keyLiterals(config)) {
    if (namespaces.has(literal.split('.')[0])) used.set(literal, 'astro.config.mjs')
  }

  assert.ok(used.size > 50, 'expected to find the keys used by the site')
  const missing = [...used].filter(([literal]) => ![...englishKeys].some(matcherFor(literal)))
  assert.deepEqual(missing, [], 'keys used in code but missing from src/i18n/en.json')
})

const translations = (await readdir(i18nDir)).filter((name) => name.endsWith('.json') && name !== 'en.json')

for (const fileName of translations) {
  test(`${fileName} only has keys and placeholders that en.json has`, async () => {
    const catalog = await readCatalog(fileName)
    const unknown = Object.keys(catalog).filter((key) => !englishKeys.has(key))
    assert.deepEqual(unknown, [], 'keys that en.json lacks')

    const mismatched = Object.entries(catalog)
      .filter(([key, value]) => englishKeys.has(key) && typeof value === 'string' && value !== '')
      .filter(([key, value]) => placeholdersOf(value).join(' ') !== placeholdersOf(english[key]).join(' '))
      .map(([key]) => key)
    assert.deepEqual(mismatched, [], 'values whose {placeholders} differ from en.json')

    const notStrings = Object.entries(catalog).filter(([, value]) => typeof value !== 'string').map(([key]) => key)
    assert.deepEqual(notStrings, [])
  })
}

test('the guard runs with no translation catalogs at all', () => {
  assert.ok(Array.isArray(translations))
})
