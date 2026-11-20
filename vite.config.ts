import { defineConfig } from 'vite';

// Relative base so the built site works at any GitHub Pages path
// (username.github.io/ or username.github.io/repo-name/) without changes.
export default defineConfig({
  base: './',
});
