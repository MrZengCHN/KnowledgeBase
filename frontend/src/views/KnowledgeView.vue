<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadKnowledgeData, renderKnowledgeFile } from '@/services/knowledgeLoader'

const route = useRoute()
const router = useRouter()

const { modules, fileIndex, assetIndex } = loadKnowledgeData()
const moduleIndex = new Map(modules.map((module) => [module.id, module]))

const selectedModuleId = ref('')
const selectedFileId = ref('')
const renderedHtml = ref('')
const tocItems = ref([])
const activeHeadingId = ref('')
const notice = ref('')
const readingProgress = ref(0)

const contentScrollRef = ref(null)
const copyResetTimers = new Map()

const hasModules = computed(() => modules.length > 0)
const selectedModule = computed(() => moduleIndex.get(selectedModuleId.value) ?? null)
const selectedFile = computed(() => fileIndex.get(selectedFileId.value) ?? null)
const isModuleOverview = computed(() => !selectedModuleId.value)

const defaultModule = computed(() => modules.find((module) => module.files.length > 0) ?? modules[0] ?? null)
const defaultFile = computed(() => defaultModule.value?.files[0] ?? null)

function pickQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0] ?? ''
  }
  return typeof value === 'string' ? value : ''
}

function createCanonicalQuery(moduleId, fileId) {
  if (!moduleId) {
    return {}
  }
  if (!fileId) {
    return { module: moduleId }
  }
  return {
    module: moduleId,
    file: fileId
  }
}

function isSameQuery(a, b) {
  const aModule = pickQueryValue(a.module)
  const aFile = pickQueryValue(a.file)
  const bModule = pickQueryValue(b.module)
  const bFile = pickQueryValue(b.file)
  return aModule === bModule && aFile === bFile
}

function navigateToQuery(query, mode = 'push') {
  if (isSameQuery(route.query, query)) {
    return
  }
  router[mode]({ name: 'knowledge', query })
}

function applyRouteState() {
  const moduleQuery = pickQueryValue(route.query.module)
  const fileQuery = pickQueryValue(route.query.file)

  if (!hasModules.value) {
    selectedModuleId.value = ''
    selectedFileId.value = ''
    notice.value = ''
    if (moduleQuery || fileQuery) {
      navigateToQuery({}, 'replace')
    }
    return
  }

  if (!moduleQuery && !fileQuery) {
    selectedModuleId.value = ''
    selectedFileId.value = ''
    notice.value = ''
    return
  }

  if (fileQuery && fileIndex.has(fileQuery)) {
    const file = fileIndex.get(fileQuery)
    selectedModuleId.value = file.moduleId
    selectedFileId.value = file.id
    notice.value = ''
    navigateToQuery(createCanonicalQuery(file.moduleId, file.id), 'replace')
    return
  }

  if (moduleQuery && moduleIndex.has(moduleQuery) && !fileQuery) {
    const module = moduleIndex.get(moduleQuery)
    const firstFile = module.files[0]
    selectedModuleId.value = module.id
    selectedFileId.value = firstFile?.id ?? ''
    notice.value = ''
    navigateToQuery(createCanonicalQuery(module.id, firstFile?.id ?? ''), 'replace')
    return
  }

  const fallbackModule = defaultModule.value
  const fallbackFile = defaultFile.value
  selectedModuleId.value = fallbackModule?.id ?? ''
  selectedFileId.value = fallbackFile?.id ?? ''
  notice.value = '链接参数无效，已回退到默认文档。'
  navigateToQuery(createCanonicalQuery(fallbackModule?.id ?? '', fallbackFile?.id ?? ''), 'replace')
}

function openModule(moduleId) {
  const module = moduleIndex.get(moduleId)
  if (!module) {
    return
  }
  const firstFile = module.files[0]
  selectedModuleId.value = module.id
  selectedFileId.value = firstFile?.id ?? ''
  notice.value = ''
  navigateToQuery(createCanonicalQuery(module.id, firstFile?.id ?? ''))
}

function openFile(fileId) {
  const file = fileIndex.get(fileId)
  if (!file) {
    return
  }
  selectedModuleId.value = file.moduleId
  selectedFileId.value = file.id
  notice.value = ''
  navigateToQuery(createCanonicalQuery(file.moduleId, file.id))
}

function backToModules() {
  selectedModuleId.value = ''
  selectedFileId.value = ''
  notice.value = ''
  navigateToQuery({})
}

function escapeSelector(value) {
  if (typeof window !== 'undefined' && window.CSS?.escape) {
    return window.CSS.escape(value)
  }
  return value.replace(/([ #;?%&,.+*~\':"!^$[\]()=>|/@])/g, '\\$1')
}

function updateActiveHeading() {
  const container = contentScrollRef.value
  if (!container || tocItems.value.length === 0) {
    activeHeadingId.value = ''
    return
  }

  const containerTop = container.getBoundingClientRect().top
  let current = tocItems.value[0]?.id ?? ''

  for (const item of tocItems.value) {
    const selector = `#${escapeSelector(item.id)}`
    const heading = container.querySelector(selector)
    if (!heading) {
      continue
    }
    const delta = heading.getBoundingClientRect().top - containerTop
    if (delta <= 80) {
      current = item.id
    } else {
      break
    }
  }

  activeHeadingId.value = current
}

function updateReadingProgress() {
  const container = contentScrollRef.value
  if (!container) {
    readingProgress.value = 0
    return
  }
  const maxScroll = container.scrollHeight - container.clientHeight
  const rawProgress = maxScroll <= 0 ? 0 : (container.scrollTop / maxScroll) * 100
  readingProgress.value = Math.min(100, Math.max(0, rawProgress))
}

function handleContentScroll() {
  updateReadingProgress()
  updateActiveHeading()
}

function clearCopyResetTimer(button) {
  const timerId = copyResetTimers.get(button)
  if (timerId) {
    window.clearTimeout(timerId)
    copyResetTimers.delete(button)
  }
}

function setCopyButtonState(button, text, status = '') {
  button.textContent = text
  if (status) {
    button.dataset.status = status
  } else {
    button.removeAttribute('data-status')
  }
}

function scheduleCopyButtonReset(button) {
  clearCopyResetTimer(button)
  const timerId = window.setTimeout(() => {
    setCopyButtonState(button, '复制')
    copyResetTimers.delete(button)
  }, 2000)
  copyResetTimers.set(button, timerId)
}

async function tryCopyText(text) {
  if (!navigator?.clipboard?.writeText) {
    throw new Error('Clipboard API 不可用')
  }
  await navigator.clipboard.writeText(text)
}

function scrollToInlineAnchor(anchorId) {
  const container = contentScrollRef.value
  if (!container || !anchorId) {
    return
  }
  const id = anchorId.startsWith('#') ? anchorId.slice(1) : anchorId
  if (!id) {
    return
  }
  const decoded = (() => {
    try {
      return decodeURIComponent(id)
    } catch {
      return id
    }
  })()
  const target = container.querySelector(`#${escapeSelector(decoded)}`)
  if (!target) {
    return
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function handleContentClick(event) {
  const target = event.target
  if (!(target instanceof Element)) {
    return
  }

  const copyButton = target.closest('.kb-code-copy-btn')
  if (copyButton && contentScrollRef.value?.contains(copyButton)) {
    const codeElement = copyButton.closest('.kb-code-block')?.querySelector('pre code')
    const codeText = codeElement?.textContent ?? ''
    if (!codeText) {
      return
    }

    clearCopyResetTimer(copyButton)
    setCopyButtonState(copyButton, '复制中...')
    try {
      await tryCopyText(codeText)
      setCopyButtonState(copyButton, '已复制', 'success')
    } catch {
      setCopyButtonState(copyButton, '复制失败', 'error')
    }
    scheduleCopyButtonReset(copyButton)
    return
  }

  const anchor = target.closest('a[href]')
  if (!anchor || !contentScrollRef.value?.contains(anchor)) {
    return
  }
  const href = anchor.getAttribute('href') || ''
  if (!href.startsWith('#') || href.startsWith('#/')) {
    return
  }
  event.preventDefault()
  scrollToInlineAnchor(href)
}

function scrollToHeading(headingId) {
  const container = contentScrollRef.value
  if (!container) {
    return
  }
  const selector = `#${escapeSelector(headingId)}`
  const heading = container.querySelector(selector)
  if (!heading) {
    return
  }
  heading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeHeadingId.value = headingId
}

watch(
  () => [route.query.module, route.query.file, modules.length],
  () => {
    applyRouteState()
  },
  { immediate: true }
)

watch(
  () => selectedFile.value,
  async (file) => {
    if (!file) {
      renderedHtml.value = ''
      tocItems.value = []
      activeHeadingId.value = ''
      readingProgress.value = 0
      return
    }

    const rendered = renderKnowledgeFile(file, fileIndex, assetIndex)
    renderedHtml.value = rendered.html
    tocItems.value = rendered.toc
    activeHeadingId.value = rendered.toc[0]?.id ?? ''

    await nextTick()
    if (contentScrollRef.value) {
      contentScrollRef.value.scrollTop = 0
      handleContentScroll()
    }
  },
  { immediate: true }
)

onMounted(() => {
  applyRouteState()
  updateReadingProgress()
})

onBeforeUnmount(() => {
  for (const timerId of copyResetTimers.values()) {
    window.clearTimeout(timerId)
  }
  copyResetTimers.clear()
})
</script>

<template>
  <div class="container mx-auto px-4 py-5">
    <div v-if="notice" class="alert alert-warning mb-4 text-sm">
      <span>{{ notice }}</span>
    </div>

    <div v-if="!hasModules" class="rounded-xl border border-base-300 p-8 text-center text-base-content/60">
      未发现 Markdown 文档，请在 <code>knowledge/</code> 目录下添加 <code>.md</code> 文件。
    </div>

    <div v-else-if="isModuleOverview" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <button
        v-for="module in modules"
        :key="module.id"
        class="text-left rounded-xl border border-base-300 bg-base-100 hover:bg-base-200 transition-colors p-5"
        @click="openModule(module.id)"
      >
        <div class="text-lg font-semibold">{{ module.name }}</div>
        <div class="text-sm text-base-content/60 mt-2">{{ module.count }} 篇文档</div>
      </button>
    </div>

    <div v-else>
      <div class="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_240px] h-[calc(100vh-110px)]">
        <aside class="hidden lg:flex lg:flex-col rounded-xl border border-base-300 bg-base-100 p-3 h-full min-h-0">
          <div class="flex items-center justify-between px-2 pb-2">
            <h2 class="font-semibold">文件列表</h2>
            <button class="btn btn-xs btn-outline" @click="backToModules">返回模块</button>
          </div>
          <div class="text-xs text-base-content/60 px-2 pb-2 break-all">{{ selectedFile?.relativePath }}</div>
          <ul class="space-y-1 overflow-y-auto min-h-0">
            <li v-for="file in selectedModule?.files || []" :key="file.id">
              <button
                class="w-full text-left rounded-lg py-2 pr-2 text-sm hover:bg-base-200 transition-colors"
                :class="{ 'bg-primary/10 text-primary font-medium': selectedFileId === file.id }"
                :style="{ paddingLeft: `${12 + file.depth * 16}px` }"
                @click="openFile(file.id)"
              >
                <div>{{ file.name }}</div>
                <div class="text-xs text-base-content/55 break-all">{{ file.pathInModule }}</div>
              </button>
            </li>
          </ul>
        </aside>

        <main class="relative rounded-xl border border-base-300 bg-base-100 p-3 lg:p-4 h-full min-h-0">
          <div class="kb-reading-progress" aria-hidden="true">
            <div class="kb-reading-progress__bar" :style="{ width: `${readingProgress}%` }"></div>
          </div>

          <div class="lg:hidden space-y-2 mb-3">
            <div class="flex items-center justify-between">
              <button class="btn btn-xs btn-outline" @click="backToModules">返回模块</button>
              <span class="text-xs text-base-content/60 break-all">{{ selectedFile?.relativePath }}</span>
            </div>
            <details class="rounded-lg border border-base-300 bg-base-100">
              <summary class="px-3 py-2 cursor-pointer font-medium">文件</summary>
              <ul class="px-2 pb-2 space-y-1">
                <li v-for="file in selectedModule?.files || []" :key="`m-${file.id}`">
                  <button
                    class="w-full text-left rounded-lg py-2 pr-2 text-sm hover:bg-base-200 transition-colors"
                    :class="{ 'bg-primary/10 text-primary font-medium': selectedFileId === file.id }"
                    :style="{ paddingLeft: `${12 + file.depth * 14}px` }"
                    @click="openFile(file.id)"
                  >
                    {{ file.pathInModule }}
                  </button>
                </li>
              </ul>
            </details>
            <details class="rounded-lg border border-base-300 bg-base-100">
              <summary class="px-3 py-2 cursor-pointer font-medium">目录</summary>
              <ul v-if="tocItems.length" class="px-2 pb-2 space-y-1">
                <li v-for="item in tocItems" :key="`m-toc-${item.id}`">
                  <button
                    class="w-full text-left rounded-md py-1.5 px-2 text-sm hover:bg-base-200"
                    :class="{ 'text-primary font-medium': activeHeadingId === item.id }"
                    :style="{ paddingLeft: `${8 + (item.level - 1) * 12}px` }"
                    @click="scrollToHeading(item.id)"
                  >
                    {{ item.text }}
                  </button>
                </li>
              </ul>
              <div v-else class="px-3 pb-3 text-sm text-base-content/60">暂无标题导航</div>
            </details>
          </div>

          <div
            ref="contentScrollRef"
            class="h-full overflow-y-auto pr-1"
            @scroll="handleContentScroll"
            @click="handleContentClick"
          >
            <article v-if="selectedFile" class="markdown-body" v-html="renderedHtml"></article>
            <div v-else class="text-base-content/60 text-sm p-4">
              该模块暂无文档。
            </div>
          </div>
        </main>

        <aside class="hidden lg:flex lg:flex-col rounded-xl border border-base-300 bg-base-100 p-3 h-full min-h-0">
          <h2 class="font-semibold px-2 pb-2">标题导航</h2>
          <ul v-if="tocItems.length" class="space-y-1 overflow-y-auto min-h-0">
            <li v-for="item in tocItems" :key="item.id">
              <button
                class="w-full text-left rounded-lg py-1.5 px-2 text-sm hover:bg-base-200 transition-colors"
                :class="{ 'text-primary font-medium bg-primary/10': activeHeadingId === item.id }"
                :style="{ paddingLeft: `${8 + (item.level - 1) * 12}px` }"
                @click="scrollToHeading(item.id)"
              >
                {{ item.text }}
              </button>
            </li>
          </ul>
          <div v-else class="px-2 text-sm text-base-content/60">暂无标题导航</div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.kb-reading-progress {
  height: 3px;
  border-radius: 999px;
  background: var(--color-base-300);
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.kb-reading-progress__bar {
  height: 100%;
  width: 0;
  background: var(--color-primary);
  transition: width 120ms linear;
}

.markdown-body {
  max-width: 84ch;
  margin: 0 auto;
  padding: 0.2rem 0.2rem 3rem;
  line-height: 1.78;
  font-size: 0.98rem;
  color: var(--color-base-content);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  scroll-margin-top: 16px;
  margin-top: 1.35em;
  margin-bottom: 0.55em;
  line-height: 1.35;
  letter-spacing: 0.01em;
  font-weight: 700;
}

.markdown-body :deep(h1) {
  font-size: 1.82rem;
}

.markdown-body :deep(h2) {
  font-size: 1.46rem;
}

.markdown-body :deep(h3) {
  font-size: 1.2rem;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol),
.markdown-body :deep(blockquote) {
  margin: 0.85em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.35rem;
}

.markdown-body :deep(li + li) {
  margin-top: 0.25rem;
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--color-base-300);
  padding-left: 0.9rem;
  color: color-mix(in oklch, var(--color-base-content) 75%, white 25%);
}

.markdown-body :deep(code) {
  font-family: Consolas, Monaco, 'Courier New', monospace;
  background: var(--color-base-200);
  border: 1px solid var(--color-base-300);
  border-radius: 0.375rem;
  padding: 0.1rem 0.3rem;
  font-size: 0.9em;
}

.markdown-body :deep(.kb-code-block) {
  border: 1px solid #2a2a2a;
  border-radius: 0.65rem;
  overflow: hidden;
  margin: 1rem 0;
  background: #000 !important;
}

.markdown-body :deep(.kb-code-toolbar) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.45rem 0.65rem;
  border-bottom: 1px solid #2a2a2a;
  background: #000 !important;
}

.markdown-body :deep(.kb-code-lang) {
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  font-weight: 700;
  color: #d1d5db;
  opacity: 1;
}

.markdown-body :deep(.kb-code-copy-btn) {
  border: 1px solid #4b5563;
  border-radius: 0.4rem;
  background: #111827;
  color: #e5e7eb;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0.35rem 0.55rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.markdown-body :deep(.kb-code-copy-btn:hover) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.markdown-body :deep(.kb-code-copy-btn[data-status='success']) {
  border-color: var(--color-success);
  color: var(--color-success);
}

.markdown-body :deep(.kb-code-copy-btn[data-status='error']) {
  border-color: var(--color-error);
  color: var(--color-error);
}

.markdown-body :deep(pre) {
  margin: 0;
  padding: 0.8rem 0.95rem;
  overflow-x: auto;
  background: #000 !important;
}

.markdown-body :deep(pre code) {
  display: block;
  border: none;
  background: #000 !important;
  padding: 0;
  font-size: 0.88rem;
  line-height: 1.6;
  tab-size: 2;
}

.markdown-body :deep(.hljs) {
  background: #000 !important;
  color: #d4d8e0;
}

.markdown-body :deep(.hljs-keyword),
.markdown-body :deep(.hljs-selector-tag),
.markdown-body :deep(.hljs-literal),
.markdown-body :deep(.hljs-title),
.markdown-body :deep(.hljs-section) {
  color: #7dd3fc;
}

.markdown-body :deep(.hljs-string),
.markdown-body :deep(.hljs-attribute),
.markdown-body :deep(.hljs-symbol),
.markdown-body :deep(.hljs-bullet),
.markdown-body :deep(.hljs-addition) {
  color: #86efac;
}

.markdown-body :deep(.hljs-comment),
.markdown-body :deep(.hljs-quote),
.markdown-body :deep(.hljs-deletion) {
  color: #9ca3af;
}

.markdown-body :deep(.hljs-number),
.markdown-body :deep(.hljs-variable),
.markdown-body :deep(.hljs-template-variable),
.markdown-body :deep(.hljs-tag .hljs-attr),
.markdown-body :deep(.hljs-regexp),
.markdown-body :deep(.hljs-link) {
  color: #f9a8d4;
}

.markdown-body :deep(.hljs-built_in),
.markdown-body :deep(.hljs-type),
.markdown-body :deep(.hljs-class .hljs-title) {
  color: #fcd34d;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid var(--color-base-300);
  padding: 0.5rem 0.6rem;
  vertical-align: top;
}

.markdown-body :deep(th) {
  background: var(--color-base-200);
}

.markdown-body :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.8rem 0;
}

.markdown-body :deep(.task-list-item) {
  list-style: none;
}

.markdown-body :deep(.task-list-item-checkbox) {
  margin-right: 0.45rem;
  transform: translateY(0.08rem);
  pointer-events: none;
}

.markdown-body :deep(.footnotes-sep) {
  border: 0;
  border-top: 1px dashed var(--color-base-300);
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.markdown-body :deep(.footnotes) {
  font-size: 0.92rem;
  opacity: 0.9;
}

.markdown-body :deep(.footnote-item p) {
  margin: 0.55rem 0;
}

.markdown-body :deep(.footnote-ref),
.markdown-body :deep(.footnote-backref) {
  text-decoration: none;
}
</style>
