import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    visualizer({
      open: false,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Tiptap core from extensions
          'tiptap-core': [
            '@tiptap/vue-3',
            '@tiptap/core',
          ],
          // Group Tiptap extensions together
          'tiptap-extensions': [
            '@tiptap/starter-kit',
            '@tiptap/extension-collaboration',
            '@tiptap/extension-collaboration-caret',
            '@tiptap/extension-color',
            '@tiptap/extension-text-style',
            '@tiptap/extension-highlight',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-text-align',
            '@tiptap/extension-typography',
            '@tiptap/extension-underline',
            '@tiptap/extension-subscript',
            '@tiptap/extension-superscript',
            '@tiptap/extension-mathematics',
            '@tiptap/extension-emoji',
            '@tiptap/extension-mention',
            '@tiptap/extension-unique-id',
            '@tiptap/extension-horizontal-rule',
            '@tiptap/extension-image',
            '@tiptap/extension-task-item',
            '@tiptap/extension-task-list',
          ],
          // Radix UI components
          'radix-ui': [
            'radix-vue',
            '@floating-ui/vue',
          ],
          // Collaboration stack
          'collab': [
            'yjs',
          ],
        }
      }
    }
  }
})
