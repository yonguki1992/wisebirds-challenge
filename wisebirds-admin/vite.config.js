import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import viteSvgLoader from 'vite-svg-loader';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    vue(),
    vueDevTools(),
    viteSvgLoader(),
  ],
  resolve: {

    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
