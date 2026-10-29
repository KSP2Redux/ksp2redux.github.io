import assert from 'node:assert/strict'
import test from 'node:test'

import { selectFeedPosts } from '../src/lib/blogFeed.ts'

const post = (id, date, draft) => ({ id, data: { date: new Date(date), ...(draft === undefined ? {} : { draft }) } })

const entries = [
  post('blog/old', '2026-01-01'),
  post('blog/new', '2026-03-01'),
  post('blog/middle', '2026-02-01'),
  post('blog/hidden', '2026-04-01', true),
  post('de/blog/middle', '2026-02-01'),
  post('de/blog/old', '2026-01-01', true),
  post('de/blog/orphan', '2026-05-01'),
  post('ru/blog/old', '2026-01-01'),
  post('guides/installation', '2026-06-01'),
  post('blog/index', '2026-06-01'),
  post('de/guides/installation', '2026-06-01')
]

const summary = (posts) => posts.map(({ slug, link, translated }) => [slug, link, translated])

test('the English feed has the English posts only, newest first, without drafts', () => {
  assert.deepEqual(summary(selectFeedPosts(entries)), [
    ['new', '/blog/new/', false],
    ['middle', '/blog/middle/', false],
    ['old', '/blog/old/', false]
  ])
})

test('a language feed has its translated posts and the English post for every other slug', () => {
  assert.deepEqual(summary(selectFeedPosts(entries, 'de')), [
    ['orphan', '/de/blog/orphan/', true],
    ['new', '/blog/new/', false],
    ['middle', '/de/blog/middle/', true],
    // The translation is a draft, so the English post stands in.
    ['old', '/blog/old/', false]
  ])
  assert.deepEqual(summary(selectFeedPosts(entries, 'ru')).filter(([, , translated]) => translated), [
    ['old', '/ru/blog/old/', true]
  ])
})

test('a language feed of a language without translations is the English posts', () => {
  const english = summary(selectFeedPosts(entries))
  assert.deepEqual(summary(selectFeedPosts(entries, 'fr')), english)
})

test('posts on the same date keep their collection order', () => {
  const same = [post('blog/b', '2026-01-01'), post('blog/a', '2026-01-01'), post('blog/c', '2026-01-02')]
  assert.deepEqual(selectFeedPosts(same).map((item) => item.slug), ['c', 'b', 'a'])
})

test('feed selection works with no entries at all', () => {
  assert.deepEqual(selectFeedPosts([]), [])
  assert.deepEqual(selectFeedPosts([], 'de'), [])
})
