import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '$lib': resolve(__dirname, './src/lib'),
      '$store': resolve(__dirname, './src/store'),
      '$src': resolve(__dirname, './src')
    }
  },
  css: {
    devSourcemap: true
  }
})
