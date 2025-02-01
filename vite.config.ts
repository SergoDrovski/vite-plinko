import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import {fileURLToPath} from "node:url";
import sveltePreprocess from 'svelte-preprocess';

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte({
    preprocess: sveltePreprocess(),
  })],
  resolve: {
    alias: {
      '$lib': fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  },
  base: "./",
  build: {
    outDir: "docs",
  },
})
