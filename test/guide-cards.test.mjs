import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { guideCards } from '../src/data/guideCards.ts'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const english = JSON.parse(await readFile(path.join(rootDir, 'src', 'i18n', 'en.json'), 'utf8'))

const cardKeys = Object.entries(guideCards).flatMap(([set, cards]) =>
  cards.flatMap((card) => [`guideCards.${set}.${card.id}.title`, `guideCards.${set}.${card.id}.body`])
)

test('every guide card has a title and a body in en.json', () => {
  assert.ok(cardKeys.length > 0)
  const missing = cardKeys.filter((key) => typeof english[key] !== 'string' || english[key].trim() === '')
  assert.deepEqual(missing, [], 'card keys missing from src/i18n/en.json')
})

test('every guideCards key in en.json belongs to a card', () => {
  const used = new Set(cardKeys)
  const unused = Object.keys(english).filter((key) => key.startsWith('guideCards.') && !used.has(key))
  assert.deepEqual(unused, [], 'guideCards keys that no card in src/data/guideCards.ts uses')
})

test('a card body has a {link} pair exactly when the card has a link target', () => {
  for (const [set, cards] of Object.entries(guideCards)) {
    for (const card of cards) {
      const body = english[`guideCards.${set}.${card.id}.body`]
      assert.equal(body.includes('{link}') && body.includes('{/link}'), Boolean(card.href), `${set}.${card.id}`)
    }
  }
})

test('card ids are unique within a set', () => {
  for (const [set, cards] of Object.entries(guideCards)) {
    const ids = cards.map((card) => card.id)
    assert.equal(new Set(ids).size, ids.length, set)
  }
})

test('in-page card links point at an anchor that exists in the guide', async () => {
  const guide = await readFile(path.join(rootDir, 'src', 'content', 'docs', 'guides', 'contributing.mdx'), 'utf8')
  for (const card of guideCards.contributing) {
    assert.match(card.href, /^#/)
    assert.ok(guide.includes(`<a id="${card.href.slice(1)}"></a>`), `${card.href} has no anchor in contributing.mdx`)
  }
})
