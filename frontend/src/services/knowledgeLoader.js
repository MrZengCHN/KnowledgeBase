import MarkdownIt from 'markdown-it'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

const markdownSources = import.meta.glob('@knowledge/**/*.{md,markdown}', {
  eager: true,
  query: '?raw',
  import: 'default'
})

const assetSources = import.meta.glob(
  '@knowledge/**/*.{png,jpg,jpeg,gif,svg,webp,avif,pdf,zip,doc,docx,xls,xlsx,ppt,pptx}',
  {
    eager: true,
    import: 'default'
  }
)

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false
})
  .use(markdownItTaskLists, {
    enabled: true,
    label: true,
    labelAfter: true
  })
  .use(markdownItFootnote)

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sh', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('py', python)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)

function normalizeFenceLanguage(info) {
  const firstToken = String(info || '').trim().split(/\s+/)[0] || ''
  return {
    normalized: firstToken.toLowerCase(),
    label: firstToken || 'text'
  }
}

function highlightFenceContent(content, language) {
  if (language && hljs.getLanguage(language)) {
    return hljs.highlight(content, { language, ignoreIllegals: true }).value
  }
  return md.utils.escapeHtml(content)
}

function renderFence(tokens, idx) {
  const token = tokens[idx]
  const { normalized, label } = normalizeFenceLanguage(token.info)
  const safeLabel = md.utils.escapeHtml(label.toUpperCase())
  const safeLanguageClass = normalized ? ` language-${md.utils.escapeHtml(normalized)}` : ''
  const highlighted = highlightFenceContent(token.content, normalized)

  return (
    `<div class="kb-code-block">` +
    `<div class="kb-code-toolbar">` +
    `<span class="kb-code-lang">${safeLabel}</span>` +
    `<button class="kb-code-copy-btn" type="button">复制</button>` +
    `</div>` +
    `<pre><code class="hljs${safeLanguageClass}">${highlighted}</code></pre>` +
    `</div>`
  )
}

md.renderer.rules.fence = renderFence

function normalizePath(input) {
  return input.replace(/\\/g, '/').replace(/^\/+/, '')
}

function extractKnowledgeRelativePath(globKey) {
  const normalized = normalizePath(globKey)
  const lower = normalized.toLowerCase()
  const marker = '/knowledge/'
  const idx = lower.lastIndexOf(marker)
  if (idx >= 0) {
    return normalizePath(normalized.slice(idx + marker.length))
  }

  const marker2 = 'knowledge/'
  const idx2 = lower.indexOf(marker2)
  if (idx2 >= 0) {
    return normalizePath(normalized.slice(idx2 + marker2.length))
  }

  return normalized
}

function dirname(filePath) {
  const path = normalizePath(filePath)
  const idx = path.lastIndexOf('/')
  return idx === -1 ? '' : path.slice(0, idx)
}

function resolveRelativePath(fromFilePath, targetPath) {
  const rawTarget = String(targetPath || '').replace(/\\/g, '/')
  if (rawTarget.startsWith('/')) {
    return normalizePath(rawTarget.slice(1))
  }

  const normalizedTarget = normalizePath(rawTarget)
  const base = dirname(fromFilePath)
  const merged = base ? `${base}/${normalizedTarget}` : normalizedTarget
  const mergedSegments = normalizePath(merged).split('/')
  const stack = []

  for (const segment of mergedSegments) {
    if (!segment || segment === '.') {
      continue
    }
    if (segment === '..') {
      if (stack.length > 0) {
        stack.pop()
      }
      continue
    }
    stack.push(segment)
  }

  return stack.join('/')
}

function safeDecodeURIComponent(input) {
  try {
    return decodeURIComponent(input)
  } catch {
    return input
  }
}

function splitUrl(input) {
  const str = String(input || '')
  const hashIndex = str.indexOf('#')
  const queryIndex = str.indexOf('?')
  const cutIndex =
    hashIndex === -1
      ? queryIndex
      : queryIndex === -1
        ? hashIndex
        : Math.min(hashIndex, queryIndex)

  if (cutIndex === -1) {
    return {
      path: str,
      suffix: ''
    }
  }

  return {
    path: str.slice(0, cutIndex),
    suffix: str.slice(cutIndex)
  }
}

function getTopModuleId(filePath) {
  const segments = normalizePath(filePath).split('/').filter(Boolean)
  if (segments.length <= 1) {
    return '__uncategorized__'
  }
  return segments[0]
}

function createPathInModule(filePath, moduleId) {
  const normalized = normalizePath(filePath)
  if (moduleId === '__uncategorized__') {
    return normalized
  }
  const prefix = `${moduleId}/`
  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length)
  }
  return normalized
}

function createHeadingId(text, used, index) {
  const fallback = `section-${index}`
  const base = (text || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || fallback

  let candidate = base
  let suffix = 2
  while (used.has(candidate)) {
    candidate = `${base}-${suffix}`
    suffix += 1
  }
  used.add(candidate)
  return candidate
}

function isExternalOrAnchorLink(url) {
  if (!url) {
    return true
  }
  if (url.startsWith('#')) {
    return true
  }
  if (url.startsWith('//')) {
    return true
  }
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url)
}

function ensureExternalLinkAttrs(token) {
  token.attrSet('target', '_blank')
  token.attrSet('rel', 'noopener noreferrer')
}

function ensureImageAttrs(token) {
  token.attrSet('referrerpolicy', 'no-referrer')
  token.attrSet('loading', 'lazy')
  token.attrSet('decoding', 'async')
}

function createCanonicalQuery(moduleId, fileId) {
  return {
    module: moduleId,
    file: fileId
  }
}

function rewriteInlineLinks(tokens, file, fileIndex, assetIndex) {
  for (const token of tokens) {
    if (token.type !== 'inline' || !token.children) {
      continue
    }

    for (const child of token.children) {
      if (child.type === 'link_open') {
        const href = child.attrGet('href')
        if (!href) {
          continue
        }

        if (/^https?:\/\//i.test(href)) {
          ensureExternalLinkAttrs(child)
          continue
        }

        if (isExternalOrAnchorLink(href)) {
          continue
        }

        const { path, suffix } = splitUrl(href)
        const decodedPath = safeDecodeURIComponent(path)
        const resolvedPath = resolveRelativePath(file.relativePath, decodedPath)
        if (!resolvedPath) {
          continue
        }

        const ext = resolvedPath.toLowerCase()
        if (ext.endsWith('.md') || ext.endsWith('.markdown')) {
          const linkedFile = fileIndex.get(resolvedPath)
          if (!linkedFile) {
            continue
          }

          const query = createCanonicalQuery(linkedFile.moduleId, linkedFile.id)
          const nextHref =
            `#/knowledge?module=${encodeURIComponent(query.module)}` +
            `&file=${encodeURIComponent(query.file)}`
          child.attrSet('href', nextHref)
          continue
        }

        const assetUrl = assetIndex.get(resolvedPath)
        if (assetUrl) {
          child.attrSet('href', `${assetUrl}${suffix}`)
        }
      }

      if (child.type === 'image') {
        const src = child.attrGet('src')
        if (!src) {
          continue
        }

        ensureImageAttrs(child)

        if (isExternalOrAnchorLink(src)) {
          continue
        }

        const { path, suffix } = splitUrl(src)
        const decodedPath = safeDecodeURIComponent(path)
        const resolvedPath = resolveRelativePath(file.relativePath, decodedPath)
        if (!resolvedPath) {
          continue
        }

        const assetUrl = assetIndex.get(resolvedPath)
        if (assetUrl) {
          child.attrSet('src', `${assetUrl}${suffix}`)
        }
      }
    }
  }
}

function extractTocAndInjectHeadingIds(tokens) {
  const usedIds = new Set()
  const toc = []

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token.type !== 'heading_open') {
      continue
    }

    const level = Number(token.tag.slice(1))
    if (Number.isNaN(level) || level < 1 || level > 4) {
      continue
    }

    const inline = tokens[i + 1]
    const title = inline?.type === 'inline' ? inline.content.trim() : ''
    const id = createHeadingId(title, usedIds, toc.length + 1)
    token.attrSet('id', id)
    toc.push({
      id,
      text: title || `未命名标题 ${toc.length + 1}`,
      level
    })
  }

  return toc
}

export function loadKnowledgeData() {
  const moduleMap = new Map()
  const fileIndex = new Map()
  const assetIndex = new Map()

  for (const [key, content] of Object.entries(markdownSources)) {
    const relativePath = normalizePath(extractKnowledgeRelativePath(key))
    if (!relativePath) {
      continue
    }

    const moduleId = getTopModuleId(relativePath)
    const moduleName = moduleId === '__uncategorized__' ? '未分类' : moduleId
    const pathInModule = createPathInModule(relativePath, moduleId)
    const segments = pathInModule.split('/').filter(Boolean)
    const depth = Math.max(segments.length - 1, 0)
    const fileName = segments[segments.length - 1] || relativePath

    const file = {
      id: relativePath,
      moduleId,
      name: fileName,
      relativePath,
      pathInModule,
      depth,
      contentRaw: String(content ?? '')
    }

    if (!moduleMap.has(moduleId)) {
      moduleMap.set(moduleId, {
        id: moduleId,
        name: moduleName,
        files: []
      })
    }

    moduleMap.get(moduleId).files.push(file)
    fileIndex.set(file.id, file)
  }

  for (const [key, assetUrl] of Object.entries(assetSources)) {
    const relativePath = normalizePath(extractKnowledgeRelativePath(key))
    if (!relativePath) {
      continue
    }
    assetIndex.set(relativePath, String(assetUrl))
  }

  const modules = Array.from(moduleMap.values())
    .map((module) => ({
      ...module,
      files: module.files.sort((a, b) => a.relativePath.localeCompare(b.relativePath, 'zh-CN'))
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    .map((module) => ({
      ...module,
      count: module.files.length
    }))

  return {
    modules,
    fileIndex,
    assetIndex
  }
}

export function renderKnowledgeFile(file, fileIndex, assetIndex) {
  if (!file) {
    return {
      html: '',
      toc: []
    }
  }

  const tokens = md.parse(file.contentRaw || '', {})
  rewriteInlineLinks(tokens, file, fileIndex, assetIndex)
  const toc = extractTocAndInjectHeadingIds(tokens)
  const html = md.renderer.render(tokens, md.options, {})

  return {
    html,
    toc
  }
}
