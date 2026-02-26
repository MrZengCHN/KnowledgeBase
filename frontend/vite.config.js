import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

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
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@knowledge': path.resolve(__dirname, '../knowledge')
    },
  },
})
