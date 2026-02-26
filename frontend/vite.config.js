import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

function isInsideDirectory(targetPath, directoryPath) {
  const relative = path.relative(directoryPath, targetPath)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function knowledgeHotReloadPlugin() {
  const knowledgeDir = path.resolve(__dirname, '../knowledge')

  return {
    name: 'knowledge-hot-reload',
    configureServer(server) {
      server.watcher.add([knowledgeDir, path.join(knowledgeDir, '**/*')])

      let reloadTimer = null
      const triggerReload = (rawPath) => {
        const filePath = path.resolve(rawPath)
        if (!isInsideDirectory(filePath, knowledgeDir)) {
          return
        }

        if (reloadTimer) {
          clearTimeout(reloadTimer)
        }
        reloadTimer = setTimeout(() => {
          server.moduleGraph.invalidateAll()
          server.ws.send({ type: 'full-reload' })
          reloadTimer = null
        }, 60)
      }

      server.watcher.on('add', triggerReload)
      server.watcher.on('unlink', triggerReload)
      server.watcher.on('addDir', triggerReload)
      server.watcher.on('unlinkDir', triggerReload)
      server.watcher.on('change', triggerReload)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/KnowledgeBase/',
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')]
    }
  },
  build: {
    outDir: '../',
    emptyOutDir: false,
  },
  plugins: [
    {
      name: 'clean-assets',
      buildStart() {
        const assetsDir = path.resolve(__dirname, '../assets')
        if (fs.existsSync(assetsDir)) {
          fs.rmSync(assetsDir, { recursive: true, force: true })
          console.log(`\nDeleted ${assetsDir}`)
        }
      }
    },
    knowledgeHotReloadPlugin(),
    vue(),
    vueDevTools({
      launchEditor: "idea"
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@knowledge': path.resolve(__dirname, '../knowledge')
    },
  },
})
