import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['vue', 'vue-router', '@ionic/vue', '@ionic/vue-router']
  },
  resolve: {
    alias: {
      'vue-router': 'vue-router/dist/vue-router.esm-bundler.js'
    }
  }
})