import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      '$shared': resolve(__dirname, './src/shared'),
      '$core': resolve(__dirname, './src/core'),
      '$features': resolve(__dirname, './src/features'),
      '$app': resolve(__dirname, './src/app'),
      '$src': resolve(__dirname, './src'),
      // Legacy alias kept for wailsjs compatibility
      '$lib': resolve(__dirname, './src/shared'),
    }
  },
  css: {
    devSourcemap: true
  }
})
