(function () {
  'use strict'

  function escapeHtml (value) {
    return String(value || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  function escapeAttribute (value) {
    return String(value || '').replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  }

  CMS.registerEditorComponent({
    id: 'youtube',
    label: 'YouTube video',
    fields: [
      { name: 'id', label: 'Video ID', widget: 'string' },
      { name: 'title', label: 'Accessible title', widget: 'string' }
    ],
    pattern: /^<YouTube\s+id="([^"]+)"\s+title="([^"]+)"\s*\/>$/m,
    fromBlock: function (match) {
      return { id: match[1], title: match[2] }
    },
    toBlock: function (data) {
      return '<YouTube id="' + escapeAttribute(data.id) + '" title="' + escapeAttribute(data.title) + '" />'
    },
    toPreview: function (data) {
      return '<div style="padding:1rem;border:1px solid #777;border-radius:.5rem">YouTube: <strong>' +
        escapeHtml(data.title) + '</strong> (' + escapeHtml(data.id) + ')</div>'
    }
  })

  CMS.registerEditorComponent({
    id: 'aside',
    label: 'Starlight aside',
    fields: [
      {
        name: 'type',
        label: 'Type',
        widget: 'select',
        options: ['note', 'tip', 'caution', 'danger'],
        default: 'note'
      },
      { name: 'title', label: 'Title', widget: 'string', required: false },
      { name: 'contents', label: 'Contents', widget: 'richtext' }
    ],
    pattern: /^<Aside\s+type="([^"]+)"(?:\s+title="([^"]*)")?\s*>\s*([\s\S]*?)\s*<\/Aside>$/m,
    fromBlock: function (match) {
      return { type: match[1], title: match[2] || '', contents: match[3] }
    },
    toBlock: function (data) {
      var title = data.title ? ' title="' + escapeAttribute(data.title) + '"' : ''
      return '<Aside type="' + escapeAttribute(data.type) + '"' + title + '>\n' + data.contents + '\n</Aside>'
    },
    toPreview: function (data) {
      return '<aside style="padding:1rem;border-left:4px solid #7c8cff;background:#eef0ff;color:#222"><strong>' +
        escapeHtml(data.title || data.type) + '</strong><div>' + escapeHtml(data.contents) + '</div></aside>'
    }
  })

  CMS.registerEditorComponent({
    id: 'card',
    label: 'Starlight card',
    fields: [
      { name: 'title', label: 'Title', widget: 'string' },
      { name: 'icon', label: 'Icon', widget: 'string', required: false },
      { name: 'contents', label: 'Contents', widget: 'richtext' }
    ],
    pattern: /^<Card\s+title="([^"]+)"(?:\s+icon="([^"]+)")?\s*>\s*([\s\S]*?)\s*<\/Card>$/m,
    fromBlock: function (match) {
      return { title: match[1], icon: match[2] || '', contents: match[3] }
    },
    toBlock: function (data) {
      var icon = data.icon ? ' icon="' + escapeAttribute(data.icon) + '"' : ''
      return '<Card title="' + escapeAttribute(data.title) + '"' + icon + '>\n' + data.contents + '\n</Card>'
    },
    toPreview: function (data) {
      return '<section style="padding:1rem;border:1px solid #777;border-radius:.5rem"><strong>' +
        escapeHtml(data.title) + '</strong><div>' + escapeHtml(data.contents) + '</div></section>'
    }
  })
})()
