import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import vm from 'node:vm'

class TestMap {
  constructor (values) {
    this.values = values
  }

  get (key) {
    return this.values[key]
  }

  set (key, value) {
    return new TestMap({ ...this.values, [key]: value })
  }
}

async function loadPreSaveHandler () {
  const listeners = []
  const source = await readFile(new URL('../public/admin/editor-components.js', import.meta.url), 'utf8')

  vm.runInNewContext(source, {
    CMS: {
      registerEditorComponent: function () {},
      registerEventListener: function (listener) { listeners.push(listener) }
    }
  })

  return listeners.find((listener) => listener.name === 'preSave').handler
}

async function saveBody (body) {
  const handler = await loadPreSaveHandler()
  const entry = new TestMap({ data: new TestMap({ body }) })
  return handler({ entry }).get('body')
}

test('converts HTTP autolinks into MDX-safe Markdown links', async () => {
  assert.equal(
    await saveBody('See <https://example.com/abc> and <http://example.com/a_(b)>.'),
    'See [https://example.com/abc](https://example.com/abc) and [http://example.com/a_(b)](http://example.com/a_\\(b\\)).'
  )
})

test('does not alter autolinks in inline or fenced code', async () => {
  const body = [
    'Use `<https://example.com/inline>` as an example.',
    '',
    '```md',
    '<https://example.com/fenced>',
    '```',
    '',
    'Convert <https://example.com/real>.'
  ].join('\n')

  assert.equal(
    await saveBody(body),
    body.replace(
      '<https://example.com/real>',
      '[https://example.com/real](https://example.com/real)'
    )
  )
})

test('leaves entries without a string body unchanged', async () => {
  const handler = await loadPreSaveHandler()
  const data = new TestMap({ title: 'Guide' })
  const result = handler({ entry: new TestMap({ data }) })

  assert.equal(result, data)
})
